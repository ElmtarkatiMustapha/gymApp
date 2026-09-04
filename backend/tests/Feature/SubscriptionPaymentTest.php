<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_partial_and_later_payments_drive_balances_and_turnover(): void
    {
        $user = User::findOrFail(1);
        Sanctum::actingAs($user);

        $plan = Plan::create([
            'title' => 'Monthly',
            'description' => 'Monthly plan',
            'duration' => 1,
            'price' => 100,
            'color' => '#000000',
            'user_id' => $user->id,
        ]);
        $customer = Customer::create([
            'name' => 'Payment Test',
            'sexe' => 'male',
            'state' => true,
            'user_id' => $user->id,
        ]);

        Carbon::setTestNow('2026-09-02 10:00:00');

        $createResponse = $this->postJson('/api/subscriptions', [
            'customer_id' => $customer->id,
            'plan_id' => $plan->id,
            'start_at' => '2026-09-01',
            'payment_type' => 'partial',
            'amount_paid' => 40,
            'payment_date' => '2020-01-01', // Ignored: the server always uses today.
        ]);

        $createResponse->assertCreated();
        $subscriptionId = $createResponse->json('data.id');

        $showResponse = $this->getJson("/api/subscriptions/{$subscriptionId}");
        $showResponse->assertOk();
        $this->assertEquals(40, $showResponse->json('data.paid_amount'));
        $this->assertEquals(60, $showResponse->json('data.remaining_amount'));
        $this->assertDatabaseHas('subscription_payments', [
            'subscription_id' => $subscriptionId,
            'amount' => 40,
            'paid_at' => '2026-09-02',
        ]);

        Carbon::setTestNow('2026-09-03 10:00:00');

        $this->postJson("/api/subscriptions/{$subscriptionId}/payments", [
            'amount' => 60,
            'paid_at' => '2020-01-01', // Ignored: the server always uses today.
        ])->assertCreated();
        $this->assertDatabaseHas('subscription_payments', [
            'subscription_id' => $subscriptionId,
            'amount' => 60,
            'paid_at' => '2026-09-03',
        ]);

        $this->getJson("/api/subscriptions/{$subscriptionId}")
            ->assertOk()
            ->assertJsonPath('data.remaining_amount', 0)
            ->assertJsonPath('data.payment_status', 'Paid');

        $statisticsResponse = $this->getJson('/api/statistics?filter=range&startDate=2026-09-02&endDate=2026-09-03');
        $statisticsResponse
            ->assertOk()
            ->assertJsonPath('data.turnover.total', 100)
            ->assertJsonPath('data.payments.received', 100)
            ->assertJsonPath('data.payments.outstanding', 0);
        $this->assertTrue(array_is_list($statisticsResponse->json('data.turnover.chart')));

        $this->deleteJson("/api/subscriptions/{$subscriptionId}")->assertOk();
        $this->assertSoftDeleted(Subscription::class, ['id' => $subscriptionId]);
        $this->assertDatabaseCount('subscription_payments', 2);

        // Received money remains in historical turnover after removing the subscription.
        $this->getJson('/api/statistics?filter=range&startDate=2026-09-02&endDate=2026-09-03')
            ->assertOk()
            ->assertJsonPath('data.turnover.total', 100);
    }

    public function test_payment_cannot_exceed_the_remaining_balance(): void
    {
        $user = User::findOrFail(1);
        Sanctum::actingAs($user);

        $plan = Plan::create([
            'title' => 'Monthly',
            'description' => 'Monthly plan',
            'duration' => 1,
            'price' => 100,
            'color' => '#000000',
            'user_id' => $user->id,
        ]);
        $customer = Customer::create([
            'name' => 'Overpayment Test',
            'sexe' => 'female',
            'state' => true,
            'user_id' => $user->id,
        ]);

        Carbon::setTestNow('2026-09-03 10:00:00');

        $subscription = Subscription::create([
            'start_at' => '2026-09-01',
            'expire_at' => '2026-10-01',
            'duration' => 1,
            'price' => 100,
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'customer_id' => $customer->id,
        ]);
        $subscription->payments()->create([
            'amount' => 90,
            'paid_at' => '2026-09-02',
            'user_id' => $user->id,
        ]);

        $this->postJson("/api/subscriptions/{$subscription->id}/payments", [
            'amount' => 11,
        ])->assertBadRequest();

        $this->assertEquals(90, $subscription->payments()->sum('amount'));
    }
}
