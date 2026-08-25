<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCostSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'overhead_pct' => ['required', 'numeric', 'min:0', 'max:500'],
            'profit_margin_pct' => ['required', 'numeric', 'min:0', 'max:2000'],
            'labor_cost_per_hour_brl' => ['required', 'numeric', 'min:0'],
        ];
    }
}
