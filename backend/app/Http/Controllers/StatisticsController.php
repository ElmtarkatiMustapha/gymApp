<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Subscription;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;
use Exception;

class StatisticsController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        try {
            $filter = $request->input('filter', 'all');
            $startDateParam = $request->input('startDate');
            $endDateParam = $request->input('endDate');

            $now = Carbon::now();
            $startDate = null;
            $endDate = null;

            if ($filter == 'today') {
                $startDate = Carbon::today();
                $endDate = Carbon::today()->endOfDay();
            } elseif ($filter == 'yesterday') {
                $startDate = Carbon::yesterday();
                $endDate = Carbon::yesterday()->endOfDay();
            } elseif ($filter == 'week') {
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
            } elseif ($filter == 'month') {
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
            } elseif ($filter == 'year') {
                $startDate = Carbon::now()->startOfYear();
                $endDate = Carbon::now()->endOfYear();
            } elseif ($filter == 'range' && $startDateParam && $endDateParam) {
                $startDate = Carbon::parse($startDateParam)->startOfDay();
                $endDate = Carbon::parse($endDateParam)->endOfDay();
            }

            // Turnover: revenue based on created_at from both Subscriptions and Insurances
            $subTurnoverQuery = Subscription::query();
            if ($startDate && $endDate) {
                $subTurnoverQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $subTurnover = $subTurnoverQuery->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(price) as total'))
                ->groupBy('date')
                ->get();

            $insTurnoverQuery = Insurance::query();
            if ($startDate && $endDate) {
                $insTurnoverQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $insTurnover = $insTurnoverQuery->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(price) as total'))
                ->groupBy('date')
                ->get();

            $turnover = $subTurnover->concat($insTurnover)
                ->groupBy('date')
                ->map(function ($items, $date) {
                    return [
                        'date' => $date,
                        'total' => $items->sum('total')
                    ];
                })
                ->values()
                ->sortBy('date') // Ensure order for chart
                ->toArray();

            // New customers per day basd on created_at
            $newCustomersQuery = Customer::query();
            if ($startDate && $endDate) {
                $newCustomersQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $newCustomers = $newCustomersQuery->select(
                    DB::raw('DATE(created_at) as date'),
                    'sexe',
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('date', 'sexe')
                ->orderBy('date')
                ->get();

            // Subscriptions per day based on created_at
            $subscriptionsWeeklyQuery = Subscription::join('customers', 'subscriptions.customer_id', '=', 'customers.id');
            if ($startDate && $endDate) {
                $subscriptionsWeeklyQuery->whereBetween('subscriptions.created_at', [$startDate, $endDate]);
            }
            $subscriptionsWeekly = $subscriptionsWeeklyQuery->select(
                    DB::raw('DATE(subscriptions.created_at) as date'),
                    'customers.sexe',
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('date', 'customers.sexe')
                ->orderBy('date')
                ->get();

            // Subscriptions per state (Current Snapshot of all subscribers)
            $allSubscriptions = Subscription::all();
            $stateStats = ['Active' => 0, 'Pre-expire' => 0, 'Expired' => 0, 'Upcoming' => 0];
            foreach ($allSubscriptions as $sub) {
                $subStart = Carbon::parse($sub->start_at);
                $subExpire = Carbon::parse($sub->expire_at);
                
                if ($subStart->isFuture()) {
                    $stateStats['Upcoming']++;
                } elseif ($subExpire->isPast()) {
                    $stateStats['Expired']++;
                } elseif ($now->diffInDays($subExpire) <= 7) {
                    $stateStats['Pre-expire']++;
                } else {
                    $stateStats['Active']++;
                }
            }

            // Subscriptions per plan, grouped by gender (Global Overview)
            $subscriptionsPerPlan = Subscription::join('customers', 'subscriptions.customer_id', '=', 'customers.id')
                ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                ->select(
                    'plans.title as plan_name',
                    'customers.sexe',
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('plans.title', 'customers.sexe')
                ->get();

            // Total turnover
            $totalSubTurnoverQuery = Subscription::query();
            $totalInsTurnoverQuery = Insurance::query();
            if ($startDate && $endDate) {
                $totalSubTurnoverQuery->whereBetween('created_at', [$startDate, $endDate]);
                $totalInsTurnoverQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $totalSubTurnover = $totalSubTurnoverQuery->sum('price');
            $totalInsTurnover = $totalInsTurnoverQuery->sum('price');
            $totalTurnover = $totalSubTurnover + $totalInsTurnover;

            // Total subscriptions this period
            $totalSubscriptionsQuery = Subscription::query();
            if ($startDate && $endDate) {
                $totalSubscriptionsQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $totalSubscriptions = $totalSubscriptionsQuery->count();

            // Total new customers this period
            $totalNewCustomersQuery = Customer::query();
            if ($startDate && $endDate) {
                $totalNewCustomersQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $totalNewCustomers = $totalNewCustomersQuery->count();

            return response([
                "message" => "success",
                "data" => [
                    "turnover" => [
                        "chart" => $turnover,
                        "total" => $totalTurnover,
                    ],
                    "newCustomers" => [
                        "chart" => $newCustomers,
                        "total" => $totalNewCustomers,
                    ],
                    "subscriptions" => [
                        "chart" => $subscriptionsWeekly,
                        "total" => $totalSubscriptions,
                    ],
                    "subscriptionsPerState" => $stateStats,
                    "subscriptionsPerPlan" => $subscriptionsPerPlan,
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
