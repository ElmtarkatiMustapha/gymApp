<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Insurance;
use Illuminate\Support\Facades\Auth;
use Exception;
use App\Mail\NotificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    /**
     * Configure SMTP from settings.json
     */
    private function configureSMTP()
    {
        $path = resource_path('js/settings.json');
        if (!File::exists($path)) {
            throw new Exception("Settings file not found");
        }
        $content = File::get($path);
        $settings = json_decode($content, true);

        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $settings["emailSettings"]['host'] ?? '',
            'port' => $settings["emailSettings"]['port'] ?? 587,
            'encryption' => 'tls',
            'username' => $settings["emailSettings"]['username'] ?? '',
            'password' => $settings["emailSettings"]['password'] ?? '',
            'timeout' => null,
            'auth_mode' => null,
        ]);
        Config::set('mail.from', [
            'address' => $settings["emailSettings"]['username'] ?? '',
            'name' => $settings['businessInfo']['name'] ?? 'GYM App',
        ]);

        Mail::purge('smtp');

        return $settings;
    }

    /**
     * Send notification to a customer
     */
    private function sendNotification($customer, $subscription, $type, $settings)
    {
        $template = $settings['messageTemplate'][$type] ?? '';
        $planName = $subscription->plan->title ?? 'N/A';
        $expiryDate = Carbon::parse($subscription->expire_at)->format('d-m-Y');

        $messageBody = str_replace(
            ['{name}', '{plan_name}', '{expiry_date}'],
            [$customer->name, $planName, $expiryDate],
            $template
        );

        $subject = "L'etat de votre abonnement";

        Mail::mailer('smtp')->to($customer->email)->queue(new NotificationMail($customer->name, $messageBody, $subject));

        if ($type === 'preExpiration') {
            $subscription->increment('pre_notice_times');
        } else {
            $subscription->increment('expire_notice_times');
        }
        $subscription->update(['last_notified_at' => Carbon::now()]);
        $subscription->increment('notice_times');
    }

    private function applyFilters($query, Request $request)
    {
        $filter = $request->input('filter', 'all');
        $filterSexe = $request->input('filterSexe', 'all');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        // Apply Sex Filter
        if ($filterSexe !== 'all') {
            $query->where('sexe', $filterSexe);
        }

        // Apply Date Filter
        $query->when($filter == 'today', function ($q) {
            $q->whereDate('created_at', \Carbon\Carbon::today());
        })
        ->when($filter == 'yesterday', function ($q) {
            $q->whereDate('created_at', \Carbon\Carbon::yesterday());
        })
        ->when($filter == 'week', function ($q) {
            $q->whereBetween('created_at', [
                \Carbon\Carbon::now()->startOfWeek(),
                \Carbon\Carbon::now()->endOfWeek()
            ]);
        })
        ->when($filter == 'month', function ($q) {
            $q->whereMonth('created_at', \Carbon\Carbon::now()->month)
              ->whereYear('created_at', \Carbon\Carbon::now()->year);
        })
        ->when($filter == 'year', function ($q) {
            $q->whereYear('created_at', \Carbon\Carbon::now()->year);
        })
        ->when($filter == 'range' && $startDate && $endDate, function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59'
            ]);
        });

        return $query;
    }

    public function notifyAllPreExpire(Request $request)
    {
        try {
            $settings = $this->configureSMTP();
            $daysBefore = (int) ($settings['alertSettings']['days_before_expiration'] ?? 7);
            $now = Carbon::now();
            $targetDate = $now->copy()->addDays($daysBefore);

            $query = Customer::where('state', 1)
                ->with(['subscriptions' => function($q) {
                    $q->orderBy('start_at', 'desc');
                }, 'subscriptions.plan']);
            
            $query = $this->applyFilters($query, $request);
            $customers = $query->get();
            
            foreach ($customers as $customer) {
                $subscription = $customer->subscriptions->first();
                if ($subscription) {
                    $expireAt = Carbon::parse($subscription->expire_at);
                    if ($expireAt->isFuture() && $expireAt->lte($targetDate)) {
                        $this->sendNotification($customer, $subscription, 'preExpiration', $settings);
                    }
                }
            }

            return response(["message" => "Pre-expire notifications sent successfully"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function notifyAllExpired(Request $request)
    {
        try {
            $settings = $this->configureSMTP();
            $now = Carbon::now();

            $query = Customer::where('state', 1)
                ->with(['subscriptions' => function($q) {
                    $q->orderBy('start_at', 'desc');
                }, 'subscriptions.plan']);
            
            $query = $this->applyFilters($query, $request);
            $customers = $query->get();

            foreach ($customers as $customer) {
                $subscription = $customer->subscriptions->first();
                if ($subscription && Carbon::parse($subscription->expire_at)->isPast()) {
                    $this->sendNotification($customer, $subscription, 'expiration', $settings);
                }
            }

            return response(["message" => "Expired notifications sent successfully"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function notifySingleCustomer(Request $request, $id)
    {
        try {
            $settings = $this->configureSMTP();
            $customer = Customer::with(['subscriptions.plan'])->findOrFail($id);
            $subscription = $customer->subscriptions->sortByDesc('start_at')->first();

            if (!$subscription) {
                return response(["message" => "No subscription found for this customer"], Response::HTTP_BAD_REQUEST);
            }

            $now = Carbon::now();
            $expireAt = Carbon::parse($subscription->expire_at);
            
            $type = $expireAt->isPast() ? 'expiration' : 'preExpiration';
            
            $this->sendNotification($customer, $subscription, $type, $settings);

            return response(["message" => "Notification sent successfully"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function index(Request $request)
    {
        try {
            $filter = $request->input('filter', 'all');
            $filterSexe = $request->input('filterSexe', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            $search = $request->input('search');

            $query = Customer::with(['subscriptions.plan', 'subscriptions.payments', 'insurances']);

            // Apply Search
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('cin', 'like', '%' . $search . '%')
                      ->orWhere('id', $search);
                });
            }

            // Apply Date & Sex Filters using shared helper method
            $query = $this->applyFilters($query, $request);

            $customers = $query->get();
            $path = resource_path('js/settings.json');
            if (!File::exists($path)) {
                throw new Exception("Settings file not found");
            }
            $content = File::get($path);
            $settings = json_decode($content, true);
            

            // Format the data for the frontend DataTable
            $formattedCustomers = $customers->map(function($customer) use ($settings) {
                // Find active subscription
                $activeSubscription = $customer->subscriptions->sortByDesc('start_at')->first();
                $daysBeforeExpiration = $settings['alertSettings']['days_before_expiration'] ?? 7;

                $state = 'Expired';
                if ($activeSubscription) {
                    $startAt = Carbon::parse($activeSubscription->start_at);
                    $expireAt = Carbon::parse($activeSubscription->expire_at);
                    $now = Carbon::now();
                    if ($startAt->isFuture()) {
                        $state = 'Upcoming';
                    } elseif ($expireAt->isPast()) {
                        $state = 'Expired';
                    } elseif ($now->diffInDays($expireAt) <= $daysBeforeExpiration) {
                        $state = 'Pre-expire';
                    } else {
                        $state = 'Active';
                    }
                }

                $paidAmount = $activeSubscription
                    ? round((float) $activeSubscription->payments->sum('amount'), 2)
                    : 0;
                $remainingAmount = $activeSubscription
                    ? max(round((float) $activeSubscription->price - $paidAmount, 2), 0)
                    : 0;

                $planData = $activeSubscription ? [
                    'name' => $activeSubscription->plan->title ?? 'N/A',
                    'expired_at' => Carbon::parse($activeSubscription->expire_at)->format('Y-m-d'),
                    'status' => $state,
                    'paid_amount' => $paidAmount,
                    'remaining_amount' => $remainingAmount,
                    'payment_status' => $remainingAmount <= 0 ? 'Paid' : 'Partially paid',
                    ] : [
                        'name' => 'No Plan',
                        'expired_at' => 'N/A',
                        'status' => 'Expired',
                        'paid_amount' => 0,
                        'remaining_amount' => 0,
                        'payment_status' => 'Paid',
                    ];
                    
                    // Find active insurance
                    $activeInsurance = $customer->insurances->sortByDesc('start_at')->first();
                    $insuranceStatus = 'Inactive';
                    if ($activeInsurance) {
                        $insStart = Carbon::parse($activeInsurance->start_at);
                        $insExpire = Carbon::parse($activeInsurance->expire_at);
                        
                        if ($insStart->isFuture()) {
                            $insuranceStatus = 'Upcoming';
                        } elseif ($insExpire->isFuture()) {
                            $insuranceStatus = 'Active';
                        }
                    }
                    
                    return [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'cin' => $customer->cin,
                        'phone' => $customer->phone,
                        'email' => $customer->email,
                        'sexe' => $customer->sexe,
                        'birthday' => $customer->birthday,
                    'insurance' => $insuranceStatus,
                    'state' => $customer->state? "Active" : "Inactive" ,
                    'plan' => $planData,
                    'notice_times' => $activeSubscription ? ($activeSubscription->expire_notice_times + $activeSubscription->pre_notice_times) : 0
                ];
            });


            $activeCustomers = 0;
            $disactiveCustomers = 0;
            foreach ($formattedCustomers as $elem) {
                if($elem['state'] == "Active" ){
                    $activeCustomers++;
                }else{
                    $disactiveCustomers++;
                }
            }

            return response(["message" => "success", "data" => ["items"=>$formattedCustomers, "activeCustomers"=>$activeCustomers, "disactiveCustomers"=>$disactiveCustomers ]], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function create(Request $request){
        try{
            $validateFields = $request->validate([
                "name" => "required",
                "adresse" => "string|nullable",
                "email" => "nullable|email|unique:customers,email",
                "cin" => "string|nullable",
                "phone" => "string|nullable",
                "birthday" => "nullable|date",
                "state" => "required",
                "sexe" => "required",
                "plan" => "required|exists:plans,id",
                "start_at" => "required|date",
                "insurance" => "required",
                "payment_type" => "nullable|in:full,partial",
                "amount_paid" => "required_if:payment_type,partial|nullable|numeric|gt:0",
            ]);
            $user = Auth::user();
            $plan = Plan::findOrFail($validateFields['plan']);
            $paymentType = $validateFields['payment_type'] ?? 'full';
            $amountPaid = $paymentType === 'full'
                ? (float) $plan->price
                : round((float) ($validateFields['amount_paid'] ?? 0), 2);

            if ($paymentType === 'partial' && ($amountPaid <= 0 || $amountPaid >= (float) $plan->price)) {
                throw ValidationException::withMessages([
                    'amount_paid' => ['A partial payment must be greater than zero and less than the subscription price.'],
                ]);
            }

            $settingsPath = resource_path('js/settings.json');
            if (!File::exists($settingsPath)) {
                throw new Exception("Settings file not found");
            }
            $settings = json_decode(File::get($settingsPath), true);
            $insurancePrice = (float) ($settings['insurance']['price'] ?? 0);
            $insurancePeriod = (int) ($settings['insurance']['periode'] ?? 12);

            DB::beginTransaction();
            //create customer
            $customer = Customer::create([
                "name" => $validateFields['name'],
                "adresse" => $validateFields['adresse'],
                "email" => $validateFields['email'],
                "cin" => $validateFields['cin'],
                "phone" => $validateFields['phone'],
                "birthday" => $validateFields['birthday'] ?? null,
                "state" => $validateFields['state'],
                "sexe" => $validateFields['sexe'],
                "user_id" => $user->id
            ]);
            //subscription in a plan 
            //get the plan info
            //create subscription 
            $start_at = Carbon::parse($validateFields['start_at']);
            $subscription = Subscription::create([
                "start_at"=>$validateFields['start_at'],
                "expire_at"=>$start_at->copy()->addMonths($plan->duration),
                "duration"=>$plan->duration,
                "price"=>$plan->price,
                "user_id"=>$user->id,
                "plan_id"=>$plan->id,
                "customer_id"=>$customer->id
            ]);
            $subscription->payments()->create([
                'user_id' => $user->id,
                'amount' => $amountPaid,
                'paid_at' => Carbon::today()->toDateString(),
            ]);
            //pay insurance
            $insuranceStatus = 'Inactive';
            if(isset($validateFields['insurance']) && ((bool)$validateFields['insurance'])){
                $insurance = Insurance::create([
                    "start_at"=>$validateFields['start_at'],
                    "expire_at"=>$start_at->copy()->addMonths($insurancePeriod),
                    "price"=>$insurancePrice,
                    "peride"=>$insurancePeriod,
                    "user_id"=>$user->id,
                    "customer_id"=>$customer->id,
                ]);
                $insuranceStatus = 'Active';
            }
            DB::commit();
            // Return formatted data matching the index() shape
            $formattedCustomer = [
                'id' => $customer->id,
                'name' => $customer->name,
                'cin' => $customer->cin,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'sexe' => $customer->sexe,
                'birthday' => $customer->birthday,
                'insurance' => $insuranceStatus,
                'state' => $customer->state? "Active" : "Inactive" ,
                'plan' => [
                    'name' => $plan->title ?? 'N/A',
                    'expired_at' => $subscription->expire_at,
                    'paid_amount' => $amountPaid,
                    'remaining_amount' => max(round((float) $subscription->price - $amountPaid, 2), 0),
                    'payment_status' => $amountPaid >= (float) $subscription->price ? 'Paid' : 'Partially paid',
                ],
                'notice_times' => 0,
            ];
            return response(["message" => "success", "data" => $formattedCustomer], Response::HTTP_OK);
        }catch(Exception $err){
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    /**
     * Get a single customer
     */
    public function show($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            return response(["message" => "success", "data" => $customer], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * update customers info
     */
    public function update(Request $request, $id)
    {
        try {
            $validateFields = $request->validate([
                "name" => "required",
                "adresse" => "string|nullable",
                "email" => "nullable|email|unique:customers,email," . $id,
                "cin" => "string|nullable",
                "phone" => "string|nullable",
                "birthday" => "nullable|date",
                "state" => "required",
                "sexe" => "required",
            ]);

            $customer = Customer::findOrFail($id);
            $customer->update([
                "name" => $validateFields['name'],
                "adresse" => $validateFields['adresse'],
                "email" => $validateFields['email'],
                "cin" => $validateFields['cin'],
                "phone" => $validateFields['phone'],
                "birthday" => $validateFields['birthday'] ?? null,
                "state" => $validateFields['state'],
                "sexe" => $validateFields['sexe'],
            ]);

            return response(["message" => "success", "data" => $customer], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * delete a customer
     */
    public function delete($id)
    {
        try {
            $customer = Customer::findOrFail($id);
            
            // Optionally delete related records if not using cascade on delete in DB
            // $customer->subscriptions()->delete();
            // $customer->insurances()->delete();
            
            $customer->delete();

            return response(["message" => "success"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * get single customer details for the single page
     */
    public function getSingleCustomerDetails(Request $request, $id)
    {
        try {
            $filter = $request->input('filter', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            $customer = Customer::with([
                'subscriptions.plan',
                'subscriptions.payments' => function ($query) {
                    $query->orderByDesc('paid_at')->orderByDesc('id');
                },
                'insurances'
            ])->findOrFail($id);

            // Active Subscription (latest)
            $activeSubscription = $customer->subscriptions->sortByDesc('start_at')->first();
            
            // Active Insurance (latest)
            $activeInsurance = $customer->insurances->sortByDesc('start_at')->first();
            $insuranceStatus = 'Inactive';
            $insuranceExpireAt = 'N/A';
            if ($activeInsurance) {
                $startAt = Carbon::parse($activeInsurance->start_at);
                $expireAt = Carbon::parse($activeInsurance->expire_at);
                
                if ($startAt->isFuture()) {
                    $insuranceStatus = 'Upcoming';
                } elseif ($expireAt->isFuture()) {
                    $insuranceStatus = 'Active';
                }
                $insuranceExpireAt = $expireAt->format('d-m-Y');
            }

            // Historical Data filtered by date
            $applyFilter = function ($query) use ($filter, $startDate, $endDate) {
                return $query->when($filter == 'today', function ($q) {
                    $q->whereDate('created_at', Carbon::today());
                })
                ->when($filter == 'yesterday', function ($q) {
                    $q->whereDate('created_at', Carbon::yesterday());
                })
                ->when($filter == 'week', function ($q) {
                    $q->whereBetween('created_at', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ]);
                })
                ->when($filter == 'month', function ($q) {
                    $q->whereMonth('created_at', Carbon::now()->month)
                      ->whereYear('created_at', Carbon::now()->year);
                })
                ->when($filter == 'year', function ($q) {
                    $q->whereYear('created_at', Carbon::now()->year);
                })
                ->when($filter == 'range' && $startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [
                        $startDate . ' 00:00:00',
                        $endDate . ' 23:59:59'
                    ]);
                });
            };

            $subscriptionsHistory = $applyFilter($customer->subscriptions()->with([
                'plan',
                'payments' => function ($query) {
                    $query->orderByDesc('paid_at')->orderByDesc('id');
                }
            ])->getQuery())->get();
            $subscriptionsHistory->each(function ($subscription) {
                $paidAmount = round((float) $subscription->payments->sum('amount'), 2);
                $subscription->setAttribute('paid_amount', $paidAmount);
                $subscription->setAttribute(
                    'remaining_amount',
                    max(round((float) $subscription->price - $paidAmount, 2), 0)
                );
                $subscription->setAttribute(
                    'payment_status',
                    (float) $subscription->remaining_amount <= 0 ? 'Paid' : 'Partially paid'
                );
            });
            $insurancesHistory = $applyFilter($customer->insurances()->getQuery())->get();

            $activePaidAmount = $activeSubscription
                ? round((float) $activeSubscription->payments->sum('amount'), 2)
                : 0;
            $activeRemainingAmount = $activeSubscription
                ? max(round((float) $activeSubscription->price - $activePaidAmount, 2), 0)
                : 0;

            return response([
                "message" => "success",
                "data" => [
                    "customer" => [
                        "id" => $customer->id,
                        "name" => $customer->name,
                        "cin" => $customer->cin,
                        "phone" => $customer->phone,
                        "email" => $customer->email,
                        "sexe" => $customer->sexe,
                        "birthday" => $customer->birthday,
                        "state" => $customer->state ? 'Active' : 'Inactive',
                        "insurance_status" => $insuranceStatus,
                        "insurance_expire_at" => $insuranceExpireAt,
                    ],
                "active_plan" => $activeSubscription ? [
                        "id" => $activeSubscription->id,
                        "name" => $activeSubscription->plan->title ?? 'N/A',
                        "duration" => $activeSubscription->duration,
                        "price" => $activeSubscription->price,
                        "paid_amount" => $activePaidAmount,
                        "remaining_amount" => $activeRemainingAmount,
                        "payment_status" => $activeRemainingAmount <= 0 ? 'Paid' : 'Partially paid',
                        "payments" => $activeSubscription->payments,
                        "color" => $activeSubscription->plan->color,
                        "start_at" => Carbon::parse($activeSubscription->start_at)->format('d-m-Y'),
                        "expire_at" => Carbon::parse($activeSubscription->expire_at)->format('d-m-Y'),
                        "state" => Carbon::parse($activeSubscription->start_at)->isFuture() ? 'Upcoming' : (Carbon::parse($activeSubscription->expire_at)->isPast() ? 'Expired' : 'Active')
                    ] : null,
                    "subscriptions_history" => $subscriptionsHistory,
                    "insurances_history" => $insurancesHistory
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
