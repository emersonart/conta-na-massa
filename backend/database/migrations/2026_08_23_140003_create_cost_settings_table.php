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
        Schema::create('cost_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('overhead_pct', 6, 2)->default(20.00);
            $table->decimal('profit_margin_pct', 6, 2)->default(30.00);
            $table->decimal('labor_cost_per_hour_brl', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_settings');
    }
};
