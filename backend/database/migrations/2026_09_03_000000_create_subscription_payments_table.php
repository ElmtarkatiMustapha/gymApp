<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Keep payment history when a subscription is removed from the application.
            $table->softDeletes();
        });

        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscription_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->date('paid_at');
            $table->timestamps();

            $table->foreign('subscription_id')
                ->references('id')
                ->on('subscriptions')
                ->cascadeOnDelete();
            $table->index('user_id');
            $table->index('paid_at');
        });

        // Existing subscriptions were treated as fully paid by the deployed app.
        // Record that assumption in the ledger so historical turnover is preserved.
        DB::table('subscriptions')
            ->orderBy('id')
            ->chunkById(500, function ($subscriptions) {
                $payments = $subscriptions->map(function ($subscription) {
                    $paidAt = $subscription->created_at
                        ? date('Y-m-d', strtotime($subscription->created_at))
                        : date('Y-m-d');

                    return [
                        'subscription_id' => $subscription->id,
                        'user_id' => $subscription->user_id,
                        'amount' => $subscription->price,
                        'paid_at' => $paidAt,
                        'created_at' => $subscription->created_at ?? now(),
                        'updated_at' => $subscription->created_at ?? now(),
                    ];
                })->all();

                if ($payments) {
                    DB::table('subscription_payments')->insert($payments);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
