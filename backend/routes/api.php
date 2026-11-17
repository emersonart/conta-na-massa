<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AiProfileController;
use App\Http\Controllers\Api\AiUsageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CostSettingsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\RecipeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Conta na Massa (v1)
|--------------------------------------------------------------------------
*/

// Health Check Endpoint (Public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

// Public Authentication Endpoints (with rate limiting)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

// Protected Endpoints (Requires Sanctum Bearer Token / Session)
Route::middleware('auth:sanctum')->group(function () {
    // Current User Profile & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard Summary
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Ingredients CRUD
    Route::apiResource('ingredients', IngredientController::class);

    // Recipes CRUD
    Route::apiResource('recipes', RecipeController::class);

    // Cost Settings & Pricing Configuration
    Route::get('/cost-settings', [CostSettingsController::class, 'show']);
    Route::put('/cost-settings', [CostSettingsController::class, 'update']);

    // Modo Vibe — AI Chef Assistant (Rate limited per minute)
    Route::prefix('ai')->group(function () {
        Route::get('/usage/stats', [AiUsageController::class, 'stats']);
        Route::post('/chat', [AiChatController::class, 'chat'])->middleware('throttle:20,1');
        Route::get('/sessions', [AiChatController::class, 'sessions']);
        Route::get('/history', [AiChatController::class, 'history']);
        Route::get('/profile', [AiProfileController::class, 'show']);
        Route::delete('/history', [AiChatController::class, 'clearHistory']);
    });
});
