<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Subscription;
use App\Models\Customer;
use App\Models\Plan;
use Illuminate\Support\Facades\Auth;
use Exception;

class SubscriptionController extends Controller
{
    /**
     * Get all subscriptions with stats
     */
    public function index(Request $request)
    {
        try {
            $filter = $request->input('filter', 'all');
            $filterSexe = $request->input('filterSexe', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            $query = Subscription::with(['customer', 'plan']);

            // Apply Sex Filter
            if ($filterSexe !== 'all') {
                $query->whereHas('customer', function ($q) use ($filterSexe) {
                    $q->where('sexe', $filterSexe);
                });
            }

            // Apply Date Filter
            if ($filter == 'today') {
                $query->whereDate('created_at', Carbon::today());
            } elseif ($filter == 'yesterday') {
                $query->whereDate('created_at', Carbon::yesterday());
            } elseif ($filter == 'week') {
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
            } elseif ($filter == 'month') {
                $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year);
            } elseif ($filter == 'year') {
                $query->whereYear('created_at', Carbon::now()->year);
            } elseif ($filter == 'range' && $startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            }

            $subscriptions = $query->get();

            $now = Carbon::now();
            $totalCount = $subscriptions->count();
            $expiredCount = 0;
            $preExpireCount = 0;

            $formattedSubscriptions = $subscriptions->map(function ($subscription) use ($now, &$expiredCount, &$preExpireCount) {
                $expireAt = Carbon::parse($subscription->expire_at);
                $startAt = Carbon::parse($subscription->start_at);
                $state = 'Active';

                if ($startAt->isFuture()) {
                    $state = 'Upcoming';
                } elseif ($expireAt->isPast()) {
                    $state = 'Expired';
                    $expiredCount++;
                } elseif ($now->diffInDays($expireAt) <= 7) {
                    $state = 'Pre-expire';
                    $preExpireCount++;
                }

                return [
                    'id' => $subscription->id,
                    'customer' => [
                        'id' => $subscription->customer->id ?? null,
                        'name' => $subscription->customer->name ?? 'N/A',
                        'sexe' => $subscription->customer->sexe ?? 'N/A',
                    ],
                    'plan' => [
                        'name' => $subscription->plan->description ?? 'N/A',
                        'color' => $subscription->plan->color ?? '#000000',
                    ],
                    'start_at' => Carbon::parse($subscription->start_at)->format('d/m/Y'),
                    'expire_at' => $expireAt->format('d/m/Y'),
                    'state' => $state,
                    'price' => $subscription->price,
                    // 'notice_times' => $subscription->notice_times ?? 0,
                    'notice_times' => ($subscription->expire_notice_times + $subscription->pre_notice_times),
                ];
            });

            return response([
                "message" => "success",
                "data" => $formattedSubscriptions,
                "stats" => [
                    "total" => $totalCount,
                    "preExpire" => $preExpireCount,
                    "expired" => $expiredCount,
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a single subscription
     */
    public function show($id)
    {
        try {
            $subscription = Subscription::with(['customer', 'plan'])->findOrFail($id);
            $expireAt = Carbon::parse($subscription->expire_at);
            $startAt = Carbon::parse($subscription->start_at);
            $now = Carbon::now();

            if ($startAt->isFuture()) {
                $state = 'Upcoming';
            } elseif ($expireAt->isPast()) {
                $state = 'Expired';
            } elseif ($expireAt->diffInDays($now) <= 7) {
                $state = 'Pre-expire';
            } else {
                $state = 'Active';
            }

            return response([
                "message" => "success",
                "data" => [
                    'id' => $subscription->id,
                    'customer' => [
                        'id' => $subscription->customer->id ?? null,
                        'name' => $subscription->customer->name ?? 'N/A',
                        'sexe' => $subscription->customer->sexe ?? 'N/A',
                    ],
                    'plan' => [
                        'id' => $subscription->plan->id ?? null,
                        'name' => $subscription->plan->description ?? 'N/A',
                        'price' => $subscription->plan->price ?? 0,
                    ],
                    'start_at' => Carbon::parse($subscription->start_at)->format('d/m/Y'),
                    'expire_at' => $expireAt->format('d/m/Y'),
                    'duration' => $subscription->duration,
                    'price' => $subscription->price,
                    'state' => $state,
                    'notice_times' => $subscription->notice_times ?? 0,
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Create a new subscription
     */
    public function create(Request $request)
    {
        try {
            $validatedFields = $request->validate([
                "customer_id" => "required|exists:customers,id",
                "plan_id" => "required|exists:plans,id",
                "start_at" => "required|date",
            ]);

            $user = Auth::user();
            $plan = Plan::findOrFail($validatedFields['plan_id']);
            $startAt = Carbon::parse($validatedFields['start_at']);

            $subscription = Subscription::create([
                "start_at" => $validatedFields['start_at'],
                "expire_at" => $startAt->copy()->addMonths($plan->duration),
                "duration" => $plan->duration,
                "price" => $plan->price,
                "notice_times" => 0,
                "user_id" => $user->id,
                "plan_id" => $plan->id,
                "customer_id" => $validatedFields['customer_id'],
            ]);

            return response([
                "message" => "success",
                "data" => $subscription->load(['customer', 'plan'])
            ], Response::HTTP_CREATED);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Update a subscription
     */
    public function update(Request $request, $id)
    {
        try {
            $validatedFields = $request->validate([
                "start_at" => "required|date",
                "plan_id" => "required|exists:plans,id",
            ]);

            $subscription = Subscription::findOrFail($id);
            $plan = Plan::findOrFail($validatedFields['plan_id']);
            $startAt = Carbon::parse($validatedFields['start_at']);

            $subscription->update([
                "start_at" => $validatedFields['start_at'],
                "plan_id" => $plan->id,
                "expire_at" => $startAt->copy()->addMonths($plan->duration),
                "duration" => $plan->duration,
                "price" => $plan->price,
            ]);

            return response([
                "message" => "success",
                "data" => $subscription->load(['customer', 'plan'])
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete a subscription
     */
    public function delete($id)
    {
        try {
            $subscription = Subscription::findOrFail($id);
            $subscription->delete();

            return response(["message" => "success"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
