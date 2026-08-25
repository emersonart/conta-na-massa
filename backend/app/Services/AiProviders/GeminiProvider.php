<?php

namespace App\Services\AiProviders;

use Gemini;
use Gemini\Client;
use Gemini\Data\Content;
use Gemini\Data\FunctionDeclaration;
use Gemini\Data\Part;
use Gemini\Data\Schema;
use Gemini\Data\Tool;
use Gemini\Enums\DataType;
use Gemini\Enums\Role;
use Generator;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class GeminiProvider implements AiProviderInterface
{
    protected string $apiKey;
    protected string $model;
    protected ?Client $client = null;

    public function __construct(?string $apiKey = null, ?string $model = null)
    {
        $this->apiKey = $apiKey ?? (string) config('services.ai.gemini.key', env('GEMINI_API_KEY', ''));
        $this->model = $model ?? (string) config('services.ai.gemini.model', env('GEMINI_MODEL', 'gemini-2.0-flash'));
    }

    public function getName(): string
    {
        return 'gemini';
    }

    protected function getClient(): Client
    {
        if ($this->client === null) {
            $this->client = Gemini::client($this->apiKey);
        }
        return $this->client;
    }

    public function generateResponse(string $systemPrompt, array $messages, array $tools = []): array
    {
        if (empty($this->apiKey)) {
            return (new OpenAiProvider())->generateResponse($systemPrompt, $messages, $tools);
        }

        try {
            $model = $this->getClient()->generativeModel(model: $this->model);

            if (!empty($systemPrompt)) {
                $model = $model->withSystemInstruction($systemPrompt);
            }

            if (!empty($tools)) {
                $model = $model->withTool($this->buildGeminiTool($tools));
            }

            $history = [];
            $totalMessages = count($messages);
            $lastUserMessage = '';

            foreach ($messages as $i => $msg) {
                if ($i === $totalMessages - 1 && $msg['role'] === 'user') {
                    $lastUserMessage = (string) $msg['content'];
                    continue;
                }
                $history[] = Content::parse(
                    part: (string) $msg['content'],
                    role: $msg['role'] === 'assistant' ? Role::MODEL : Role::USER
                );
            }

            $chat = $model->startChat(history: $history);
            $response = $chat->sendMessage($lastUserMessage ?: 'Olá');

            $reply = '';
            $toolCalls = [];

            foreach ($response->parts() as $part) {
                if (!empty($part->text)) {
                    $reply .= $part->text;
                }
                if ($part->functionCall !== null) {
                    $toolCalls[] = [
                        'id' => uniqid('call_'),
                        'name' => $part->functionCall->name,
                        'arguments' => $part->functionCall->args ?? [],
                    ];
                }
            }

            return [
                'reply' => $reply,
                'tool_calls' => $toolCalls,
                'usage' => [],
            ];
        } catch (Throwable $e) {
            Log::error('Gemini Provider generateResponse error', ['message' => $e->getMessage()]);
            throw new RuntimeException('Erro na comunicação com a API Google Gemini: ' . $e->getMessage(), 0, $e);
        }
    }

    public function streamResponse(string $systemPrompt, array $messages, array $tools = []): Generator
    {
        if (empty($this->apiKey)) {
            yield ['type' => 'text', 'content' => "💡 [Modo Demonstração] Chave do Google Gemini não configurada no `.env`."];
            return;
        }

        try {
            $model = $this->getClient()->generativeModel(model: $this->model);

            if (!empty($systemPrompt)) {
                $model = $model->withSystemInstruction($systemPrompt);
            }

            if (!empty($tools)) {
                $model = $model->withTool($this->buildGeminiTool($tools));
            }

            $history = [];
            $totalMessages = count($messages);
            $lastUserMessage = '';

            foreach ($messages as $i => $msg) {
                if ($i === $totalMessages - 1 && $msg['role'] === 'user') {
                    $lastUserMessage = (string) $msg['content'];
                    continue;
                }
                $history[] = Content::parse(
                    part: (string) $msg['content'],
                    role: $msg['role'] === 'assistant' ? Role::MODEL : Role::USER
                );
            }

            $chat = $model->startChat(history: $history);
            $stream = $chat->streamSendMessage($lastUserMessage ?: 'Olá');

            foreach ($stream as $response) {
                foreach ($response->parts() as $part) {
                    if (!empty($part->text)) {
                        yield ['type' => 'text', 'content' => $part->text];
                    }
                    if ($part->functionCall !== null) {
                        yield [
                            'type' => 'tool_call',
                            'id' => uniqid('call_'),
                            'name' => $part->functionCall->name,
                            'arguments' => $part->functionCall->args ?? [],
                        ];
                    }
                }
            }
        } catch (Throwable $e) {
            Log::error('Gemini Provider streamResponse error', ['message' => $e->getMessage()]);
            yield [
                'type' => 'error',
                'message' => 'Erro na API Google Gemini: ' . $e->getMessage(),
            ];
        }
    }

    protected function buildGeminiTool(array $tools): Tool
    {
        $declarations = [];
        foreach ($tools as $tool) {
            $declarations[] = new FunctionDeclaration(
                name: $tool['name'],
                description: $tool['description'] ?? '',
                parameters: !empty($tool['parameters']) ? $this->convertJsonSchemaToGeminiSchema($tool['parameters']) : null,
            );
        }
        return new Tool(functionDeclarations: $declarations);
    }

    protected function convertJsonSchemaToGeminiSchema(array $schema): Schema
    {
        $typeStr = strtoupper($schema['type'] ?? 'OBJECT');
        $dataType = match ($typeStr) {
            'STRING' => DataType::STRING,
            'NUMBER' => DataType::NUMBER,
            'INTEGER' => DataType::INTEGER,
            'BOOLEAN' => DataType::BOOLEAN,
            'ARRAY' => DataType::ARRAY,
            'OBJECT' => DataType::OBJECT,
            default => DataType::OBJECT,
        };

        $properties = null;
        if (!empty($schema['properties']) && is_array($schema['properties'])) {
            $properties = [];
            foreach ($schema['properties'] as $key => $prop) {
                $properties[$key] = $this->convertJsonSchemaToGeminiSchema($prop);
            }
        }

        $items = null;
        if (!empty($schema['items']) && is_array($schema['items'])) {
            $items = $this->convertJsonSchemaToGeminiSchema($schema['items']);
        }

        return new Schema(
            type: $dataType,
            description: $schema['description'] ?? null,
            properties: $properties,
            required: $schema['required'] ?? null,
            items: $items,
            enum: $schema['enum'] ?? null,
        );
    }
}
