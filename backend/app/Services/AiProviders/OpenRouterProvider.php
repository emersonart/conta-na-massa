<?php

namespace App\Services\AiProviders;

class OpenRouterProvider extends OpenAiProvider
{
    public function __construct(?string $apiKey = null, ?string $baseUrl = null, ?string $model = null)
    {
        $key = $apiKey ?? (string) config('services.ai.openrouter.key', env('OPENROUTER_API_KEY', ''));
        $url = $baseUrl ?? (string) config('services.ai.openrouter.base_url', env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'));
        $mdl = $model ?? (string) config('services.ai.openrouter.model', env('OPENROUTER_MODEL', 'openai/gpt-4o-mini'));

        parent::__construct($key, $url, $mdl);
    }

    public function getName(): string
    {
        return 'openrouter';
    }
}
