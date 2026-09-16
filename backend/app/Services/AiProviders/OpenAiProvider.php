<?php

namespace App\Services\AiProviders;

use Generator;
use Illuminate\Support\Facades\Log;
use OpenAI;
use OpenAI\Client;
use RuntimeException;
use Throwable;

class OpenAiProvider implements AiProviderInterface
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;
    protected ?Client $client = null;

    public function __construct(?string $apiKey = null, ?string $baseUrl = null, ?string $model = null)
    {
        $this->apiKey = $apiKey ?? (string) config('services.ai.openai.key', env('OPENAI_API_KEY', ''));
        $baseUrlConfig = $baseUrl ?? (string) config('services.ai.openai.base_url', env('OPENAI_BASE_URL', ''));
        $this->baseUrl = !empty($baseUrlConfig) ? rtrim($baseUrlConfig, '/') : 'https://api.openai.com/v1';
        $this->model = $model ?? (string) config('services.ai.openai.model', env('OPENAI_MODEL', 'gpt-4o-mini'));
    }

    public function getName(): string
    {
        return 'openai';
    }

    protected function getClient(): Client
    {
        if ($this->client === null) {
            $factory = OpenAI::factory()->withApiKey($this->apiKey);

            if ($this->baseUrl !== 'https://api.openai.com/v1') {
                $factory = $factory->withBaseUri($this->baseUrl);
            }

            $this->client = $factory->make();
        }

        return $this->client;
    }

    protected function isReasoningModel(string $model): bool
    {
        return (bool) preg_match('/(^o1|^o3|^o4|deepseek-r1)/i', $model);
    }

    /**
     * Returns true for models that do not accept a custom temperature value.
     * This includes reasoning models and some newer OpenAI models (gpt-5.x, etc).
     */
    protected function supportsTemperature(string $model): bool
    {
        // Models known NOT to support custom temperature
        return !preg_match('/(^o1|^o3|^o4|gpt-5|deepseek-r1)/i', $model);
    }

    protected function buildPayload(string $systemPrompt, array $messages, array $tools = []): array
    {
        $formattedMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($messages as $msg) {
            $role = $msg['role'] ?? 'user';

            // Pass through special OpenAI message types for the agentic loop
            if ($role === 'tool') {
                $formattedMessages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $msg['tool_call_id'],
                    'content' => (string) $msg['content'],
                ];
                continue;
            }

            if ($role === 'assistant' && !empty($msg['tool_calls'])) {
                $formattedMessages[] = [
                    'role' => 'assistant',
                    'content' => $msg['content'] ?? null,
                    'tool_calls' => $msg['tool_calls'],
                ];
                continue;
            }

            $formattedMessages[] = [
                'role' => $role === 'assistant' ? 'assistant' : 'user',
                'content' => (string) $msg['content'],
            ];
        }

        $payload = [
            'model' => $this->model,
            'messages' => $formattedMessages,
        ];

        if ($this->isReasoningModel($this->model)) {
            // Reasoning models do not accept custom temperature
            if (!empty($tools)) {
                $payload['tools'] = $this->formatToolsForOpenAi($tools);
                $payload['tool_choice'] = 'auto';
                $payload['reasoning_effort'] = 'none';
            }
        } else {
            if ($this->supportsTemperature($this->model)) {
                $payload['temperature'] = 0.4;
            }
            if (!empty($tools)) {
                $payload['tools'] = $this->formatToolsForOpenAi($tools);
                $payload['tool_choice'] = 'auto';
            }
        }

        return $payload;
    }

    public function generateResponse(string $systemPrompt, array $messages, array $tools = []): array
    {
        if (empty($this->apiKey)) {
            return $this->generateOfflineMockResponse($messages);
        }

        $payload = $this->buildPayload($systemPrompt, $messages, $tools);

        try {
            $response = $this->getClient()->chat()->create($payload);
        } catch (Throwable $e) {
            $msg = $e->getMessage();
            // Retry without temperature if the model doesn't support it
            if (isset($payload['temperature']) && str_contains($msg, 'temperature')) {
                unset($payload['temperature']);
                try {
                    $response = $this->getClient()->chat()->create($payload);
                } catch (Throwable $e2) {
                    throw new RuntimeException('Erro na comunicação com a API de IA: ' . $e2->getMessage(), 0, $e2);
                }
            // If the provider fails due to tools/parameters with reasoning models, fallback without tools
            } elseif (!empty($payload['tools'])) {
                Log::warning('OpenAI tool call failed, retrying without tools', ['error' => $msg]);
                unset($payload['tools'], $payload['tool_choice'], $payload['reasoning_effort']);
                try {
                    $response = $this->getClient()->chat()->create($payload);
                } catch (Throwable $e2) {
                    throw new RuntimeException('Erro na comunicação com a API de IA: ' . $e2->getMessage(), 0, $e2);
                }
            } else {
                throw new RuntimeException('Erro na comunicação com a API de IA: ' . $msg, 0, $e);
            }
        }

        $choice = $response->choices[0] ?? null;
        $reply = $choice?->message?->content ?? '';
        $toolCalls = [];

        if (!empty($choice?->message?->toolCalls)) {
            foreach ($choice->message->toolCalls as $tc) {
                $args = json_decode($tc->function->arguments, true) ?? [];
                $toolCalls[] = [
                    'id' => $tc->id,
                    'name' => $tc->function->name,
                    'arguments' => $args,
                ];
            }
        }

        return [
            'reply' => $reply,
            'tool_calls' => $toolCalls,
            'usage' => [
                'prompt_tokens' => $response->usage?->promptTokens ?? 0,
                'completion_tokens' => $response->usage?->completionTokens ?? 0,
            ],
        ];
    }

    public function streamResponse(string $systemPrompt, array $messages, array $tools = []): Generator
    {
        if (empty($this->apiKey)) {
            yield ['type' => 'text', 'content' => "💡 [Modo Demonstração] Chave da API não configurada no `.env`."];
            return;
        }

        $payload = $this->buildPayload($systemPrompt, $messages, $tools);
        // stream_options is only valid for streaming requests
        $payload['stream_options'] = ['include_usage' => true];

        $yieldedAnyText = false;
        $accumulatedToolCalls = [];

        try {
            $stream = $this->getClient()->chat()->createStreamed($payload);

            foreach ($stream as $response) {
                $choice = $response->choices[0] ?? null;
                if (!$choice) {
                    continue;
                }

                $delta = $choice->delta;

                if (!empty($delta->content)) {
                    $yieldedAnyText = true;
                    yield [
                        'type' => 'text',
                        'content' => $delta->content,
                    ];
                }

                // Check for usage
                if (isset($response->usage) && $response->usage) {
                    yield [
                        'type' => 'usage',
                        'prompt_tokens' => $response->usage->promptTokens ?? 0,
                        'completion_tokens' => $response->usage->completionTokens ?? 0,
                        'total_tokens' => $response->usage->totalTokens ?? 0,
                    ];
                }

                if (!empty($delta->toolCalls)) {
                    foreach ($delta->toolCalls as $tc) {
                        $idx = $tc->index ?? 0;
                        if (!isset($accumulatedToolCalls[$idx])) {
                            $accumulatedToolCalls[$idx] = [
                                'id' => $tc->id ?? '',
                                'name' => $tc->function?->name ?? '',
                                'arguments' => '',
                            ];
                        }

                        if (!empty($tc->id)) {
                            $accumulatedToolCalls[$idx]['id'] = $tc->id;
                        }
                        if (!empty($tc->function?->name)) {
                            $accumulatedToolCalls[$idx]['name'] = $tc->function->name;
                        }
                        if (!empty($tc->function?->arguments)) {
                            $accumulatedToolCalls[$idx]['arguments'] .= $tc->function->arguments;
                        }
                    }
                }
            }

            foreach ($accumulatedToolCalls as $tc) {
                if (!empty($tc['name'])) {
                    $args = json_decode($tc['arguments'], true) ?? [];
                    yield [
                        'type' => 'tool_call',
                        'id' => $tc['id'],
                        'name' => $tc['name'],
                        'arguments' => $args,
                    ];
                }
            }
        } catch (Throwable $e) {
            $msg = $e->getMessage();

            // Retry without temperature if the model doesn't support it
            if (!$yieldedAnyText && isset($payload['temperature']) && str_contains($msg, 'temperature')) {
                unset($payload['temperature']);
                try {
                    $stream = $this->getClient()->chat()->createStreamed($payload);
                    foreach ($stream as $response) {
                        $choice = $response->choices[0] ?? null;
                        if ($choice && !empty($choice->delta->content)) {
                            yield ['type' => 'text', 'content' => $choice->delta->content];
                        }
                        if (isset($response->usage) && $response->usage) {
                            yield [
                                'type' => 'usage',
                                'prompt_tokens' => $response->usage->promptTokens ?? 0,
                                'completion_tokens' => $response->usage->completionTokens ?? 0,
                                'total_tokens' => $response->usage->totalTokens ?? 0,
                            ];
                        }
                    }
                    return;
                } catch (Throwable $e2) {
                    yield ['type' => 'error', 'message' => $e2->getMessage()];
                    return;
                }
            }

            Log::warning('Erro no stream OpenAI, tentando fallback...', ['error' => $msg]);

            // If we failed before yielding any text and tools were present, retry without tools
            if (!$yieldedAnyText && !empty($payload['tools'])) {
                unset($payload['tools'], $payload['tool_choice'], $payload['reasoning_effort']);
                try {
                    $stream = $this->getClient()->chat()->createStreamed($payload);
                    foreach ($stream as $response) {
                        $choice = $response->choices[0] ?? null;
                        if ($choice && !empty($choice->delta->content)) {
                            yield [
                                'type' => 'text',
                                'content' => $choice->delta->content,
                            ];
                        }
                        // Also capture usage in fallback path
                        if (isset($response->usage) && $response->usage) {
                            yield [
                                'type' => 'usage',
                                'prompt_tokens' => $response->usage->promptTokens ?? 0,
                                'completion_tokens' => $response->usage->completionTokens ?? 0,
                                'total_tokens' => $response->usage->totalTokens ?? 0,
                            ];
                        }
                    }
                    return;
                } catch (Throwable $e2) {
                    yield [
                        'type' => 'error',
                        'message' => $e2->getMessage(),
                    ];
                    return;
                }
            }

            yield [
                'type' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function formatToolsForOpenAi(array $tools): array
    {
        $formatted = [];
        foreach ($tools as $tool) {
            $formatted[] = [
                'type' => 'function',
                'function' => [
                    'name' => $tool['name'],
                    'description' => $tool['description'] ?? '',
                    'parameters' => $tool['parameters'] ?? (object) [],
                ],
            ];
        }
        return $formatted;
    }

    protected function generateOfflineMockResponse(array $messages): array
    {
        $lastUserMsg = end($messages)['content'] ?? '';
        return [
            'reply' => "💡 [Modo Demonstração] Recebi sua dúvida: \"{$lastUserMsg}\". Configure sua chave no `.env` para respostas completas!",
            'tool_calls' => [],
            'usage' => ['total_tokens' => 0],
        ];
    }
}
