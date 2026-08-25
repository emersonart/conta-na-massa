<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCostSettingRequest;
use App\Http\Resources\CostSettingResource;
use App\Models\CostSetting;
use Illuminate\Http\Request;

class CostSettingsController extends Controller
{
    /**
     * Get or create cost settings for authenticated user.
     */
    public function show(Request $request): CostSettingResource
    {
        $setting = CostSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'overhead_pct' => 20.00,
                'profit_margin_pct' => 35.00,
                'labor_cost_per_hour_brl' => 20.00,
            ]
        );

        return new CostSettingResource($setting);
    }

    /**
     * Update cost settings.
     */
    public function update(UpdateCostSettingRequest $request): CostSettingResource
    {
        $setting = CostSetting::firstOrCreate(['user_id' => $request->user()->id]);
        $setting->update($request->validated());

        return new CostSettingResource($setting);
    }
}
