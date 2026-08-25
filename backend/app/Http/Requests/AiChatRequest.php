<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:2', 'max:2000'],
            'session_id' => ['nullable', 'uuid'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Digite uma mensagem para falar com o assistente.',
            'message.min' => 'A mensagem deve conter pelo menos 2 caracteres.',
            'message.max' => 'A mensagem não pode ultrapassar 2000 caracteres.',
        ];
    }
}
