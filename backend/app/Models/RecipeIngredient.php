<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'recipe_id',
        'ingredient_id',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4',
        ];
    }

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Compute the subtotal cost for this ingredient item in the recipe.
     */
    public function getSubtotalCostBrlAttribute(): float
    {
        if (!$this->ingredient) {
            return 0.0;
        }

        return (float) ($this->quantity * $this->ingredient->cost_per_unit_brl);
    }
}
