<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiConversation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'session_id',
        'role',
        'content',
        'is_flagged',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_flagged' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
