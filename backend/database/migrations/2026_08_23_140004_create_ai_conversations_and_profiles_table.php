<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('session_id')->index();
            $table->enum('role', ['user', 'assistant']);
            $table->text('content');
            $table->boolean('is_flagged')->default(false);
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->index(['user_id', 'session_id']);
        });

        Schema::create('ai_user_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('preferences')->nullable();
            $table->text('summary')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_user_profiles');
        Schema::dropIfExists('ai_conversations');
    }
};
