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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->timestamp('start_at')->nullable();;
            $table->timestamp('expire_at')->nullable();;
            $table->integer("duration");
            $table->float("price");
            $table->integer("notice_times")->default(0);
            $table->bigInteger("user_id");
            $table->bigInteger("plan_id");
            $table->bigInteger("customer_id");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
