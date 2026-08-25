<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostSetting extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'overhead_pct',
        'profit_margin_pct',
        'labor_cost_per_hour_brl',
    ];

    protected function casts(): array
    {
        return [
            'overhead_pct' => 'decimal:2',
            'profit_margin_pct' => 'decimal:2',
            'labor_cost_per_hour_brl' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
