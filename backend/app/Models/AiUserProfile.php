<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUserProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'preferences',
        'summary',
        'last_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'last_updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
