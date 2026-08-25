<?php

namespace App\Services\AiProviders;

use Generator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class AnthropicProvider implements AiProviderInterface
{
    protected string $apiKey;
    protected string $model;

    public function __construct(?string $apiKey = null, ?string $model = null)
    {
        $this->apiKey = $apiKey ?? (string) config('services.ai.anthropic.key', env('ANTHROPIC_API_KEY', ''));
        $this->model = $model ?? (string) config('services.ai.anthropic.model', env('ANTHROPIC_MODEL', 'claude-3-5-haiku-20241022'));
    }

    public function getName(): string
    {
        return 'anthropic';
    }

    public function generateResponse(string $systemPrompt, array $messages, array $tools = []): array
    {
        if (empty($this->apiKey)) {
            return (new OpenAiProvider())->generateResponse($systemPrompt, $messages, $tools);
        }

        $formattedMessages = [];
        foreach ($messages as $msg) {
            $formattedMessages[] = [
                'role' => $msg['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => (string) $msg['content'],
            ];
        }

        $payload = [
            'model' => $this->model,
            'system' => $systemPrompt,
            'messages' => $formattedMessages,
            'max_tokens' => 2048,
            'temperature' => 0.4,
        ];

        if (!empty($tools)) {
            $payload['tools'] = array_map(function ($tool) {
                return [
                    'name' => $tool['name'],
                    'description' => $tool['description'] ?? '',
                    'input_schema' => $tool['parameters'] ?? ['type' => 'object', 'properties' => []],
                ];
            }, $tools);
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', $payload);

        if (!$response->successful()) {
            Log::error('Anthropic Provider error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new RuntimeException('Erro na comunicação com a API Anthropic: ' . $response->json('error.message', 'Falha'));
        }

        $contents = $response->json('content', []);
        $reply = '';
        $toolCalls = [];

        foreach ($contents as $block) {
            if (($block['type'] ?? '') === 'text') {
                $reply .= $block['text'] ?? '';
            } elseif (($block['type'] ?? '') === 'tool_use') {
                $toolCalls[] = [
                    'id' => $block['id'] ?? '',
                    'name' => $block['name'] ?? '',
                    'arguments' => $block['input'] ?? [],
                ];
            }
        }

        return [
            'reply' => $reply,
            'tool_calls' => $toolCalls,
            'usage' => $response->json('usage', []),
        ];
    }

    public function streamResponse(string $systemPrompt, array $messages, array $tools = []): Generator
    {
        // Fallback for Anthropic non-streaming to Generator
        try {
            $res = $this->generateResponse($systemPrompt, $messages, $tools);
            if (!empty($res['reply'])) {
                yield ['type' => 'text', 'content' => $res['reply']];
            }
            foreach ($res['tool_calls'] as $tc) {
                yield [
                    'type' => 'tool_call',
                    'id' => $tc['id'] ?? '',
                    'name' => $tc['name'],
                    'arguments' => $tc['arguments'],
                ];
            }
        } catch (Throwable $e) {
            yield ['type' => 'error', 'message' => $e->getMessage()];
        }
    }
}
