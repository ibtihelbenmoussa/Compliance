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
    Schema::table('requirement_tests', function (Blueprint $table) {
        $table->enum('validation_status', ['pending', 'accepted', 'rejected'])
              ->default('pending')
              ->after('efficacy');
        $table->text('validation_comment')
              ->nullable()
              ->after('validation_status');
    });
}

public function down(): void
{
    Schema::table('requirement_tests', function (Blueprint $table) {
        $table->dropColumn(['validation_status', 'validation_comment']);
    });
}};