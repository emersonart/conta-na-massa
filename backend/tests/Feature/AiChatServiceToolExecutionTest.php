<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AiChatService;
use App\Services\AiUserProfileService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\TestCase;

class AiChatServiceToolExecutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_reproduces_original_type_error_when_null_passed_as_argument_4(): void
    {
        $user = User::factory()->create();
        $service = new AiChatService(new AiUserProfileService());

        $reflection = new ReflectionMethod($service, 'executeToolCallsStream');

        if (count($reflection->getParameters()) === 4) {
            $this->expectException(\TypeError::class);
            $this->expectExceptionMessage('Argument #4 ($yieldTarget) must be of type Generator, null given');
            $dummy = null;
            $args = [$user, 'session-test-uuid', [], &$dummy];
            $reflection->invokeArgs($service, $args);
        } else {
            $this->markTestSkipped('Parameter 4 has already been removed.');
        }
    }

    public function test_execute_tool_calls_stream_accepts_three_arguments_without_type_error(): void
    {
        $user = User::factory()->create();
        $service = new AiChatService(new AiUserProfileService());

        $reflection = new ReflectionMethod($service, 'executeToolCallsStream');

        // Verify the method signature only requires 3 parameters (user, sessionId, toolCalls)
        $this->assertCount(
            3,
            $reflection->getParameters(),
            'executeToolCallsStream should accept exactly 3 arguments without requiring an unused Generator parameter'
        );

        $toolCalls = [
            [
                'id' => 'call_1',
                'name' => 'create_ingredient',
                'arguments' => [
                    'name' => 'Leite Ninho',
                    'unit' => 'g',
                    'package_quantity' => 1000,
                    'package_cost_brl' => 38.50,
                ],
            ],
        ];

        // Invoke executeToolCallsStream with only ($user, $sessionId, $toolCalls)
        $batch = $reflection->invoke($service, $user, 'session-test-uuid', $toolCalls);

        $this->assertIsArray($batch);
        $this->assertArrayHasKey('executed', $batch);
        $this->assertArrayHasKey('results', $batch);
        $this->assertArrayHasKey('roundTripMessages', $batch);
        $this->assertCount(1, $batch['executed']);
        $this->assertEquals('create_ingredient', $batch['executed'][0]['type']);

        $this->assertDatabaseHas('ingredients', [
            'user_id' => $user->id,
            'name' => 'Leite Ninho',
        ]);
    }
}
