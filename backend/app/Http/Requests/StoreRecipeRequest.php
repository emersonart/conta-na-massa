<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'yield_quantity' => ['required', 'numeric', 'min:0.1'],
            'yield_unit' => ['required', 'string', 'max:50'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_id' => ['required', 'uuid', 'exists:ingredients,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.0001'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da receita é obrigatório.',
            'yield_quantity.required' => 'O rendimento da receita é obrigatório.',
            'yield_unit.required' => 'A unidade de rendimento é obrigatória (ex: porções, fatias, unidades).',
            'items.required' => 'Adicione pelo menos um ingrediente na receita.',
            'items.min' => 'Adicione pelo menos um ingrediente na receita.',
            'items.*.ingredient_id.required' => 'O ingrediente é obrigatório.',
            'items.*.ingredient_id.exists' => 'Ingrediente selecionado inválido.',
            'items.*.quantity.required' => 'A quantidade utilizada é obrigatória.',
            'items.*.quantity.min' => 'A quantidade deve ser maior que zero.',
        ];
    }
}
