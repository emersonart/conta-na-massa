<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'yield_quantity' => ['sometimes', 'required', 'numeric', 'min:0.1'],
            'yield_unit' => ['sometimes', 'required', 'string', 'max:50'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['sometimes', 'array'],
            'items.*.ingredient_id' => ['required', 'uuid', 'exists:ingredients,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.0001'],
        ];
    }
}
