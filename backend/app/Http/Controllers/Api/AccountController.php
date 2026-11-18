<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\ConfirmEmailChangeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AccountController extends Controller
{
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'email' => mb_strtolower(trim((string) $request->input('email'))),
        ]);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'current_password' => ['required', 'string'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'A senha atual está incorreta.',
                'errors' => ['current_password' => ['Confira sua senha atual e tente novamente.']],
            ], 422);
        }

        $email = mb_strtolower(trim($validated['email']));
        $emailChanged = $email !== mb_strtolower($user->email);
        if ($emailChanged && app()->environment('production') && config('mail.default') === 'log') {
            return response()->json([
                'message' => 'O envio de confirmação de e-mail ainda não está configurado. Tente novamente mais tarde.',
            ], 503);
        }

        $emailAlreadyUsed = User::query()
            ->where('email', $email)
            ->where('id', '!=', $user->id)
            ->exists();
        if ($emailAlreadyUsed) {
            return response()->json([
                'message' => 'Este e-mail já está em uso.',
                'errors' => ['email' => ['Escolha outro endereço de e-mail.']],
            ], 422);
        }

        $token = $emailChanged ? Str::random(64) : null;

        $user->name = trim($validated['name']);
        if ($emailChanged) {
            $user->pending_email = $email;
            $user->email_change_token_hash = hash('sha256', $token);
            $user->email_change_expires_at = now()->addMinutes(60);
        } else {
            $user->pending_email = null;
            $user->email_change_token_hash = null;
            $user->email_change_expires_at = null;
        }
        $user->save();

        if ($emailChanged) {
            Notification::route('mail', $email)->notify(
                new ConfirmEmailChangeNotification($token, $user->name)
            );
        }

        return response()->json([
            'message' => $emailChanged
                ? 'Nome atualizado. Enviamos um link para confirmar o novo e-mail.'
                : 'Dados cadastrais atualizados.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'pending_email' => $user->pending_email,
            ],
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);

        $user = $request->user();
        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'A senha atual está incorreta.',
                'errors' => ['current_password' => ['Confira sua senha atual e tente novamente.']],
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        $currentToken = $user->currentAccessToken();
        if ($currentToken instanceof PersonalAccessToken) {
            $user->tokens()->where('id', '!=', $currentToken->getKey())->delete();
        } else {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Senha alterada. As outras sessões foram encerradas.']);
    }

    public function confirmEmailChange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'size:64'],
        ]);

        $tokenHash = hash('sha256', $validated['token']);
        $result = DB::transaction(function () use ($tokenHash): string {
            $lockedUser = User::query()
                ->where('email_change_token_hash', $tokenHash)
                ->where('email_change_expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (! $lockedUser || ! $lockedUser->pending_email) {
                return 'invalid';
            }

            $emailTaken = User::query()
                ->where('email', $lockedUser->pending_email)
                ->where('id', '!=', $lockedUser->id)
                ->exists();

            if ($emailTaken) {
                $lockedUser->forceFill([
                    'pending_email' => null,
                    'email_change_token_hash' => null,
                    'email_change_expires_at' => null,
                ])->save();

                return 'email_taken';
            }

            $lockedUser->email = $lockedUser->pending_email;
            $lockedUser->email_verified_at = now();
            $lockedUser->pending_email = null;
            $lockedUser->email_change_token_hash = null;
            $lockedUser->email_change_expires_at = null;
            $lockedUser->save();
            $lockedUser->tokens()->delete();

            return 'confirmed';
        });

        if ($result === 'invalid') {
            return response()->json([
                'message' => 'Este link é inválido, expirou ou já foi usado. Solicite a alteração novamente.',
            ], 422);
        }

        if ($result === 'email_taken') {
            return response()->json([
                'message' => 'Esse e-mail já está em uso. Tente outro endereço nas configurações da conta.',
            ], 422);
        }

        return response()->json([
            'message' => 'E-mail confirmado. Entre novamente com seu novo endereço.',
        ]);
    }
}
