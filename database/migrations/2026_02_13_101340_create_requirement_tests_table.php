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
       Schema::create('requirement_tests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('requirement_id')->constrained()->onDelete('cascade');
$table->foreignId('framework_id')->nullable()->constrained()->onDelete('cascade');    $table->foreignId('user_id')->constrained()->onDelete('restrict'); 
    $table->date('test_date');           
    $table->enum('status', ['compliant', 'non_compliant', 'partial', 'na'])->default('compliant');
    $table->text('comment')->nullable();  
    $table->json('evidence')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requirement_tests');
    }
};
