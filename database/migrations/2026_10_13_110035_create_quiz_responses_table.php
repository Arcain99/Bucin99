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
        Schema::create('quiz_responses', function (Blueprint $table) {
            $table->id();
            $table->string('respondent_name')->default('Loili');
            $table->json('answers')->nullable();
            $table->string('final_answer')->default('Iya');
            $table->text('message')->nullable();
            $table->string('chosen_date_activity')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_responses');
    }
};
