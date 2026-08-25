<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CostSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'overhead_pct' => (float) $this->overhead_pct,
            'profit_margin_pct' => (float) $this->profit_margin_pct,
            'labor_cost_per_hour_brl' => (float) $this->labor_cost_per_hour_brl,
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
