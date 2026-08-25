<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'unit' => ['sometimes', 'required', 'string', 'in:g,ml,un'],
            'package_quantity' => ['sometimes', 'required', 'numeric', 'min:0.0001'],
            'package_cost_brl' => ['sometimes', 'required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
