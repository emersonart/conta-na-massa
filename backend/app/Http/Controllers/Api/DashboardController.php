<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Recipe;
use App\Models\CostSetting;
use App\Models\AiUsageLog;
use App\Services\AiUserProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function summary(Request $request, AiUserProfileService $profileService)
    {
        $user = $request->user();

        // 1. Total ingredients
        $totalIngredients = Ingredient::where('user_id', $user->id)->count();

        // 2. Recipes (Total and Latest 6)
        $totalRecipes = Recipe::where('user_id', $user->id)->count();
        $recentRecipes = Recipe::where('user_id', $user->id)
            ->with(['ingredients'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Need to calculate financials for recipes so the frontend can display them easily
        // since the frontend usually calculates it on the fly or expects it in the response.
        // The RecipeResource does this. We can just use the RecipeResource collection.
        $recentRecipesFormatted = \App\Http\Resources\RecipeResource::collection($recentRecipes);

        // 3. Cost Settings
        $costSettings = CostSetting::where('user_id', $user->id)->first();
        if (!$costSettings) {
            $costSettings = CostSetting::create([
                'user_id' => $user->id,
                'profit_margin_pct' => 35.0,
                'overhead_pct' => 15.0,
            ]);
        }

        // 4. AI Profile
        $aiProfile = $profileService->getProfile($user);

        // 5. AI Usage Stats (Current Month)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthlyLogs = AiUsageLog::where('user_id', $user->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->get();

        $monthlyTokens = $monthlyLogs->sum('total_tokens');
        $monthlyCost = $monthlyLogs->sum('estimated_cost_brl');

        return response()->json([
            'metrics' => [
                'total_ingredients' => $totalIngredients,
                'total_recipes' => $totalRecipes,
                'avg_profit_margin' => (float) $costSettings->profit_margin_pct,
                'overhead_pct' => (float) $costSettings->overhead_pct,
            ],
            'recent_recipes' => $recentRecipesFormatted,
            'ai' => [
                'profile' => $aiProfile,
                'stats' => [
                    'monthly_tokens' => $monthlyTokens,
                    'monthly_cost_brl' => (float) $monthlyCost,
                ]
            ],
            'settings' => [
                'overhead_pct' => (float) $costSettings->overhead_pct,
                'profit_margin_pct' => (float) $costSettings->profit_margin_pct,
                'labor_cost_per_hour_brl' => (float) $costSettings->labor_cost_per_hour_brl,
            ],
        ]);
    }
}
