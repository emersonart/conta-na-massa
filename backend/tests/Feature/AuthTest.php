<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Chef Juliana',
            'email' => 'juliana@confeitaria.com',
            'password' => 'Segredo@2026',
            'password_confirmation' => 'Segredo@2026',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'juliana@confeitaria.com',
        ]);

        // Default cost setting should be created
        $user = User::where('email', 'juliana@confeitaria.com')->first();
        $this->assertNotNull($user->costSetting);
        $this->assertEquals(20.00, $user->costSetting->overhead_pct);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'juliana@confeitaria.com',
            'password' => bcrypt('Segredo@2026'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'juliana@confeitaria.com',
            'password' => 'Segredo@2026',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'juliana@confeitaria.com',
            'password' => bcrypt('Segredo@2026'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'juliana@confeitaria.com',
            'password' => 'SenhaErrada',
        ]);

        $response->assertStatus(422);
    }
}
