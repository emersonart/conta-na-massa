<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    /**
     * Test that the health endpoint returns 200 and ok status.
     */
    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertExactJson([
                'status' => 'ok',
            ]);
    }
}
