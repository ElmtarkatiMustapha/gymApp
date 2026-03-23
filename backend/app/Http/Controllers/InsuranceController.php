<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Insurance;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Exception;

class InsuranceController extends Controller
{
    /**
     * Get all insurances
     */
    public function index(Request $request)
    {
        try {
            $filter = $request->input('filter', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            $query = Insurance::with(['customer']);

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

            $insurances = $query->get();
            $now = Carbon::now();

            $formattedInsurances = $insurances->map(function ($insurance) use ($now) {
                $startAt = Carbon::parse($insurance->start_at);
                $expireAt = Carbon::parse($insurance->expire_at);
                $state = 'Active';

                if ($startAt->isFuture()) {
                    $state = 'Upcoming';
                } elseif ($expireAt->isPast()) {
                    $state = 'Disactive';
                } elseif ($now->diffInDays($expireAt) <= 7) {
                    $state = 'Pre-expire';
                }

                return [
                    'id' => $insurance->id,
                    'customer' => [
                        'id' => $insurance->customer->id ?? null,
                        'name' => $insurance->customer->name ?? 'N/A',
                    ],
                    'start_at' => Carbon::parse($insurance->start_at)->format('d/m/Y'),
                    'expire_at' => $expireAt->format('d/m/Y'),
                    'created_at' => Carbon::parse($insurance->created_at)->format('d/m/Y'),
                    'state' => $state,
                    'price' => $insurance->price,
                    'notice_times' => $insurance->notice_times ?? 0,
                ];
            });

            return response([
                "message" => "success",
                "data" => $formattedInsurances,
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a single insurance
     */
    public function show($id)
    {
        try {
            $insurance = Insurance::with(['customer'])->findOrFail($id);
            $startAt = Carbon::parse($insurance->start_at);
            $expireAt = Carbon::parse($insurance->expire_at);
            $now = Carbon::now();

            if ($startAt->isFuture()) {
                $state = 'Upcoming';
            } elseif ($expireAt->isPast()) {
                $state = 'Disactive';
            } elseif ($expireAt->diffInDays($now) <= 7) {
                $state = 'Pre-expire';
            } else {
                $state = 'Active';
            }

            return response([
                "message" => "success",
                "data" => [
                    'id' => $insurance->id,
                    'customer' => [
                        'id' => $insurance->customer->id ?? null,
                        'name' => $insurance->customer->name ?? 'N/A',
                    ],
                    'start_at' => Carbon::parse($insurance->start_at)->format('d/m/Y'),
                    'expire_at' => $expireAt->format('d/m/Y'),
                    'created_at' => Carbon::parse($insurance->created_at)->format('d/m/Y'),
                    'price' => $insurance->price,
                    'state' => $state,
                    'notice_times' => $insurance->notice_times ?? 0,
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Create a new insurance
     */
    public function create(Request $request)
    {
        try {
            $validatedFields = $request->validate([
                "customer_id" => "required|exists:customers,id",
                "start_at" => "required|date",
            ]);

            $user = Auth::user();
            $startAt = Carbon::parse($validatedFields['start_at']);
            $path = resource_path('js/settings.json');

            // Read and decode JSON
            $settings = json_decode(File::get($path), true);
            $insurancePrice = $settings["insurance"]["price"] ?? 0;
            $insurancePeriode = $settings["insurance"]["periode"] ?? 12;

            $insurance = Insurance::create([
                "start_at" => $validatedFields['start_at'],
                "expire_at" => $startAt->copy()->addMonths($insurancePeriode),
                "price" => $insurancePrice,
                "periode" => $insurancePeriode,
                "notice_times" => 0,
                "user_id" => $user->id,
                "customer_id" => $validatedFields['customer_id'],
            ]);

            return response([
                "message" => "success",
                "data" => $insurance->load(['customer'])
            ], Response::HTTP_CREATED);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Update an insurance
     */
    public function update(Request $request, $id)
    {
        try {
            $validatedFields = $request->validate([
                "start_at" => "required|date",
            ]);

            $insurance = Insurance::findOrFail($id);
            $startAt = Carbon::parse($validatedFields['start_at']);
            
            $path = resource_path('js/settings.json');
            $settings = json_decode(File::get($path), true);
            $insurancePrice = $settings["insurance"]["price"] ?? 100;
            $insurancePeriode = $settings["insurance"]["periode"] ?? 12;

            $insurance->update([
                "start_at" => $validatedFields['start_at'],
                "price" => $insurancePrice,
                "expire_at" => $startAt->copy()->addMonths($insurancePeriode),
                "periode" => $insurancePeriode,
            ]);

            return response([
                "message" => "success",
                "data" => $insurance->load(['customer'])
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete an insurance
     */
    public function delete($id)
    {
        try {
            $insurance = Insurance::findOrFail($id);
            $insurance->delete();
            return response(["message" => "success"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
