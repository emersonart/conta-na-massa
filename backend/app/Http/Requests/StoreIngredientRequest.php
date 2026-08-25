<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'in:g,ml,un'],
            'package_quantity' => ['required', 'numeric', 'min:0.0001'],
            'package_cost_brl' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do ingrediente é obrigatório.',
            'unit.required' => 'A unidade de medida é obrigatória.',
            'unit.in' => 'A unidade deve ser g (gramas), ml (mililitros) ou un (unidades).',
            'package_quantity.required' => 'A quantidade do pacote é obrigatória.',
            'package_quantity.min' => 'A quantidade do pacote deve ser maior que zero.',
            'package_cost_brl.required' => 'O preço pago no pacote é obrigatório.',
            'package_cost_brl.min' => 'O valor do pacote não pode ser negativo.',
        ];
    }
}
