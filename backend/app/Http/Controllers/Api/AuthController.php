<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\CostSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    /**
     * Register new user and issue personal access token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create default cost setting for new user
        CostSetting::create([
            'user_id' => $user->id,
            'overhead_pct' => 20.00,
            'profit_margin_pct' => 35.00,
            'labor_cost_per_hour_brl' => 20.00,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Cadastro realizado com sucesso!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'pending_email' => $user->pending_email,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate existing user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($validated['email']))])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-mail ou senha incorretos.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'pending_email' => $user->pending_email,
            ],
            'token' => $token,
        ]);
    }

    /** Send a password reset link without revealing whether an account exists. */
    public function forgotPassword(Request $request): JsonResponse
    {
        if (app()->environment('production') && config('mail.default') === 'log') {
            return response()->json([
                'message' => 'A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.',
            ], 503);
        }

        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        try {
            Password::sendResetLink(['email' => $this->canonicalEmailForPasswordBroker($validated['email'])]);
        } catch (Throwable $exception) {
            // Keep the response indistinguishable for known and unknown accounts.
            report($exception);
        }

        return response()->json([
            'message' => 'Se houver uma conta com esse e-mail, enviaremos instruções para redefinir a senha.',
        ]);
    }

    /** Check whether a password reset token is still active without consuming it. */
    public function validateResetToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        $email = $this->canonicalEmailForPasswordBroker($validated['email']);
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Password::broker()->tokenExists($user, $validated['token'])) {
            return response()->json([
                'valid' => false,
                'message' => 'Este link é inválido, expirou ou já foi usado. Solicite uma nova redefinição.',
            ], 422);
        }

        return response()->json(['valid' => true]);
    }

    /** Reset a password using Laravel's one-time, expiring password broker token. */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);
        $validated['email'] = $this->canonicalEmailForPasswordBroker($validated['email']);

        $status = Password::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // A forgotten password should invalidate every existing device session.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PasswordReset) {
            return response()->json([
                'message' => 'Este link é inválido, expirou ou já foi usado. Solicite uma nova redefinição.',
            ], 422);
        }

        return response()->json([
            'message' => 'Senha redefinida. Entre com sua nova senha.',
        ]);
    }

    /**
     * Return authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'pending_email' => $user->pending_email,
            ],
            'cost_setting' => $user->costSetting,
        ]);
    }

    /**
     * Logout and revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sessão finalizada com sucesso.',
        ]);
    }

    private function canonicalEmailForPasswordBroker(string $email): string
    {
        $normalizedEmail = mb_strtolower(trim($email));

        return User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->value('email') ?? $normalizedEmail;
    }
}
