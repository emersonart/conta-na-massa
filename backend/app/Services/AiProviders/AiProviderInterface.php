<?php

namespace App\Services\AiProviders;

use Generator;

interface AiProviderInterface
{
    /**
     * Provider identification name.
     */
    public function getName(): string;

    /**
     * Send synchronous prompt to the AI provider.
     *
     * @param string $systemPrompt
     * @param array $messages
     * @param array $tools
     * @return array Array containing 'reply', 'tool_calls', 'usage'
     */
    public function generateResponse(string $systemPrompt, array $messages, array $tools = []): array;

    /**
     * Stream response from the AI provider.
     * Yields items like:
     * - ['type' => 'text', 'content' => string]
     * - ['type' => 'tool_call', 'name' => string, 'arguments' => array]
     *
     * @param string $systemPrompt
     * @param array $messages
     * @param array $tools
     * @return Generator
     */
    public function streamResponse(string $systemPrompt, array $messages, array $tools = []): Generator;
}
