<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->default('🏢');
            $table->string('category');
            $table->string('industry');
            $table->string('business_type')->nullable();
            $table->string('gradient')->default('linear-gradient(135deg, #f97316, #fb923c)');
            $table->text('short_desc');
            $table->text('full_description');
            $table->string('established');
            $table->string('location');
            $table->string('employees');
            $table->string('address');
            $table->string('phone');
            $table->string('tin_number')->nullable();
            $table->string('business_license_number')->nullable();
            $table->string('website')->nullable();
            $table->string('license_type');
            $table->string('license_number');
            $table->string('license_issue');
            $table->string('license_expiry');
            $table->string('authority');
            $table->string('extra_doc')->nullable();
            $table->string('followers')->default('0');
            $table->string('growth')->default('0%');
            $table->string('engagement')->default('0%');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
