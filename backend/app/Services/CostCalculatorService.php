<?php

namespace App\Services;

use App\Models\CostSetting;
use App\Models\Recipe;

class CostCalculatorService
{
    /**
     * Calculate all cost and pricing metrics for a given recipe.
     *
     * @param Recipe $recipe
     * @param CostSetting|null $costSetting
     * @return array
     */
    public function calculateRecipe(Recipe $recipe, ?CostSetting $costSetting = null): array
    {
        // 1. Ingredients Cost
        $ingredientsCost = 0.0;
        $recipe->loadMissing('items.ingredient');

        $breakdownItems = [];

        foreach ($recipe->items as $item) {
            $ingredient = $item->ingredient;
            if ($ingredient) {
                $unitCost = (float) $ingredient->cost_per_unit_brl;
                $quantity = (float) $item->quantity;
                $subtotal = $quantity * $unitCost;
                $ingredientsCost += $subtotal;

                $breakdownItems[] = [
                    'id' => $item->id,
                    'ingredient_id' => $ingredient->id,
                    'name' => $ingredient->name,
                    'unit' => $ingredient->unit,
                    'quantity' => $quantity,
                    'cost_per_unit_brl' => $unitCost,
                    'subtotal_brl' => round($subtotal, 2),
                ];
            }
        }

        // 2. Settings (fallback to defaults if not set)
        $overheadPct = $costSetting ? (float) $costSetting->overhead_pct : 20.0;
        $profitMarginPct = $costSetting ? (float) $costSetting->profit_margin_pct : 30.0;
        $laborRatePerHour = $costSetting ? (float) $costSetting->labor_cost_per_hour_brl : 0.0;

        // 3. Labor Cost
        $prepTimeHours = ($recipe->prep_time_minutes ?? 0) / 60.0;
        $laborCost = $prepTimeHours * $laborRatePerHour;

        // 4. Base Cost & Total Cost with Overhead
        $baseCost = $ingredientsCost + $laborCost;
        $overheadValue = $baseCost * ($overheadPct / 100.0);
        $totalCost = $baseCost + $overheadValue;

        // 5. Suggested Selling Price & Margin
        $profitValue = $totalCost * ($profitMarginPct / 100.0);
        $suggestedSellingPrice = $totalCost + $profitValue;

        // 6. Per Portion Metrics
        $yieldQuantity = max(1.0, (float) ($recipe->yield_quantity ?: 1.0));
        $costPerPortion = $totalCost / $yieldQuantity;
        $pricePerPortion = $suggestedSellingPrice / $yieldQuantity;

        // 7. Scenarios (Venda Direta, Delivery c/ taxa 15%, Atacado c/ 20% desconto no lucro)
        $deliveryPrice = $suggestedSellingPrice * 1.15; // Repassa 15% taxa app
        $wholesalePrice = $totalCost + ($profitValue * 0.60); // 40% a menos no lucro para atacado

        return [
            'recipe_id' => $recipe->id,
            'yield_quantity' => $yieldQuantity,
            'yield_unit' => $recipe->yield_unit,
            'prep_time_minutes' => $recipe->prep_time_minutes,
            
            // Totals
            'ingredients_cost_brl' => round($ingredientsCost, 2),
            'labor_cost_brl' => round($laborCost, 2),
            'base_cost_brl' => round($baseCost, 2),
            'overhead_pct' => $overheadPct,
            'overhead_value_brl' => round($overheadValue, 2),
            'total_cost_brl' => round($totalCost, 2),
            
            // Pricing & Profit
            'profit_margin_pct' => $profitMarginPct,
            'profit_value_brl' => round($profitValue, 2),
            'suggested_selling_price_brl' => round($suggestedSellingPrice, 2),
            
            // Portions
            'cost_per_portion_brl' => round($costPerPortion, 2),
            'price_per_portion_brl' => round($pricePerPortion, 2),
            
            // Channels
            'scenarios' => [
                'direct_sale' => round($suggestedSellingPrice, 2),
                'delivery_app_15pct' => round($deliveryPrice, 2),
                'wholesale' => round($wholesalePrice, 2),
            ],
            
            'breakdown_items' => $breakdownItems,
        ];
    }
}
