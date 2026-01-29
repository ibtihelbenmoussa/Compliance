<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frameworks', function (Blueprint $table) {
            $table->bigIncrements('id');
             $table->bigInteger(column: 'organization_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('version')->nullable();

            $table->enum('type', [
                'standard',
                'regulation',
                'contract',
                'internal_policy'
            ]);

            $table->string('publisher')->nullable();

            $table->text('jurisdiction')->nullable(); 
            $table->text('scope')->nullable();

            $table->enum('status', [
                'active',
                'deprecated',
                'draft',
                'archived'
            ]);

            $table->date('release_date')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('retired_date')->nullable();

            $table->text('description')->nullable();
            $table->string('language')->nullable();
            $table->text('url_reference')->nullable();
            $table->text('tags')->nullable();
            $table->integer('is_deleted')->default(0); 
 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frameworks');
    }
};
