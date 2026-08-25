<?php

namespace Tests\Feature;

use App\Models\CostSetting;
use App\Models\Ingredient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecipeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_recipe_and_get_accurate_pricing_metrics(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        CostSetting::create([
            'user_id' => $user->id,
            'overhead_pct' => 20.00,
            'profit_margin_pct' => 40.00,
            'labor_cost_per_hour_brl' => 20.00,
        ]);

        $ing1 = Ingredient::create([
            'user_id' => $user->id,
            'name' => 'Farinha',
            'unit' => 'g',
            'package_quantity' => 1000,
            'package_cost_brl' => 10.00, // 0.01 / g
        ]);

        $ing2 = Ingredient::create([
            'user_id' => $user->id,
            'name' => 'Chocolate',
            'unit' => 'g',
            'package_quantity' => 1000,
            'package_cost_brl' => 50.00, // 0.05 / g
        ]);

        $response = $this->postJson('/api/v1/recipes', [
            'name' => 'Bolo de Chocolate Especial',
            'yield_quantity' => 10,
            'yield_unit' => 'fatias',
            'prep_time_minutes' => 60, // 1h -> R$ 20 de mão de obra
            'items' => [
                ['ingredient_id' => $ing1->id, 'quantity' => 500], // 500 * 0.01 = R$ 5.00
                ['ingredient_id' => $ing2->id, 'quantity' => 200], // 200 * 0.05 = R$ 10.00
            ],
        ]);

        // Insumos = 15.00
        // Mão de obra (1h) = 20.00
        // Base = 35.00
        // Overhead (20%) = 7.00 -> Total = 42.00
        // Lucro (40%) = 16.80 -> Preço = 58.80
        // Por porção = 5.88

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Bolo de Chocolate Especial')
            ->assertJsonPath('data.financials.ingredients_cost_brl', 15)
            ->assertJsonPath('data.financials.labor_cost_brl', 20)
            ->assertJsonPath('data.financials.total_cost_brl', 42)
            ->assertJsonPath('data.financials.suggested_selling_price_brl', 58.8)
            ->assertJsonPath('data.financials.price_per_portion_brl', 5.88);
    }
}
