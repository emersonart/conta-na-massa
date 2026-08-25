<?php

namespace App\Http\Resources;

use App\Services\CostCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $calculator = app(CostCalculatorService::class);
        $costSetting = $request->user()?->costSetting;
        $financials = $calculator->calculateRecipe($this->resource, $costSetting);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'yield_quantity' => (float) $this->yield_quantity,
            'yield_unit' => $this->yield_unit,
            'prep_time_minutes' => (int) $this->prep_time_minutes,
            'notes' => $this->notes,
            'financials' => $financials,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'ingredient_id' => $item->ingredient_id,
                        'name' => $item->ingredient?->name,
                        'unit' => $item->ingredient?->unit,
                        'quantity' => (float) $item->quantity,
                        'cost_per_unit_brl' => (float) ($item->ingredient?->cost_per_unit_brl ?? 0),
                        'subtotal_cost_brl' => round($item->subtotal_cost_brl, 2),
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
