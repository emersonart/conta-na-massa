<?php

namespace App\Services;

use App\Services\AiProviders\AiProviderInterface;
use App\Services\AiProviders\AnthropicProvider;
use App\Services\AiProviders\GeminiProvider;
use App\Services\AiProviders\OpenAiProvider;
use App\Services\AiProviders\OpenRouterProvider;
use InvalidArgumentException;

class AiProviderFactory
{
    /**
     * Resolve the active AI Provider based on AI_PROVIDER master env configuration.
     *
     * @param string|null $overrideProvider
     * @return AiProviderInterface
     */
    public static function make(?string $overrideProvider = null): AiProviderInterface
    {
        $providerName = strtolower(trim($overrideProvider ?? env('AI_PROVIDER', 'openai')));

        return match ($providerName) {
            'openai' => new OpenAiProvider(),
            'anthropic', 'claude' => new AnthropicProvider(),
            'gemini', 'google' => new GeminiProvider(),
            'openrouter' => new OpenRouterProvider(),
            default => new OpenAiProvider(),
        };
    }
}
