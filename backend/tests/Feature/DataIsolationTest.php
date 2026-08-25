<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DataIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_or_modify_another_users_ingredient(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $ingB = Ingredient::create([
            'user_id' => $userB->id,
            'name' => 'Ingrediente Secreto B',
            'unit' => 'g',
            'package_quantity' => 1000,
            'package_cost_brl' => 50,
        ]);

        Sanctum::actingAs($userA);

        // User A tries to view User B's ingredient
        $responseShow = $this->getJson("/api/v1/ingredients/{$ingB->id}");
        $responseShow->assertStatus(404);

        // User A tries to update User B's ingredient
        $responseUpdate = $this->putJson("/api/v1/ingredients/{$ingB->id}", [
            'name' => 'Tentativa de Hack',
        ]);
        $responseUpdate->assertStatus(404);

        // User A tries to delete User B's ingredient
        $responseDelete = $this->deleteJson("/api/v1/ingredients/{$ingB->id}");
        $responseDelete->assertStatus(404);
    }

    public function test_user_cannot_access_another_users_recipe_or_use_their_ingredients(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $ingB = Ingredient::create([
            'user_id' => $userB->id,
            'name' => 'Ingrediente B',
            'unit' => 'g',
            'package_quantity' => 1000,
            'package_cost_brl' => 50,
        ]);

        $recipeB = Recipe::create([
            'user_id' => $userB->id,
            'name' => 'Receita Secreta B',
            'yield_quantity' => 10,
            'yield_unit' => 'unidades',
        ]);

        Sanctum::actingAs($userA);

        // Cannot view B's recipe
        $this->getJson("/api/v1/recipes/{$recipeB->id}")->assertStatus(404);

        // Cannot create recipe linking to B's ingredient
        $responseCreate = $this->postJson('/api/v1/recipes', [
            'name' => 'Receita do User A',
            'yield_quantity' => 1,
            'yield_unit' => 'unidade',
            'items' => [
                ['ingredient_id' => $ingB->id, 'quantity' => 100],
            ],
        ]);
        $responseCreate->assertStatus(404);
    }
}
