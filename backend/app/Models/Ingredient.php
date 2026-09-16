<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ingredient extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'unit',
        'package_quantity',
        'package_cost_brl',
        'cost_per_unit_brl',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'package_quantity' => 'decimal:4',
            'package_cost_brl' => 'decimal:4',
            'cost_per_unit_brl' => 'decimal:6',
        ];
    }

    public static function boot()
    {
        parent::boot();

        static::saving(function (Ingredient $ingredient) {
            if ($ingredient->package_quantity > 0) {
                $ingredient->cost_per_unit_brl = $ingredient->package_cost_brl / $ingredient->package_quantity;
            } else {
                $ingredient->cost_per_unit_brl = 0;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}
