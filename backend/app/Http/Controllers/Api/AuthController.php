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
use Illuminate\Validation\ValidationException;

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

        $user = User::where('email', $validated['email'])->first();

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
            ],
            'token' => $token,
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
}
