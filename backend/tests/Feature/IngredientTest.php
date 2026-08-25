<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IngredientTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_ingredient_with_auto_cost(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ingredients', [
            'name' => 'Farinha de Trigo Especial',
            'unit' => 'g',
            'package_quantity' => 1000,
            'package_cost_brl' => 6.50,
            'notes' => 'Marca Dona Benta',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Farinha de Trigo Especial')
            ->assertJsonPath('data.cost_per_unit_brl', 0.0065);

        $this->assertDatabaseHas('ingredients', [
            'user_id' => $user->id,
            'name' => 'Farinha de Trigo Especial',
            'cost_per_unit_brl' => 0.0065,
        ]);
    }

    public function test_user_can_list_only_own_ingredients(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Ingredient::create([
            'user_id' => $userA->id,
            'name' => 'Manteiga A',
            'unit' => 'g',
            'package_quantity' => 200,
            'package_cost_brl' => 10,
        ]);

        Ingredient::create([
            'user_id' => $userB->id,
            'name' => 'Manteiga B',
            'unit' => 'g',
            'package_quantity' => 200,
            'package_cost_brl' => 12,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/v1/ingredients');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Manteiga A');
    }
}
