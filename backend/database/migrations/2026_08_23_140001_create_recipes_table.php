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
        Schema::create('recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('yield_quantity', 10, 2)->default(1.00);
            $table->string('yield_unit', 50)->default('porções');
            $table->integer('prep_time_minutes')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
