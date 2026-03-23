<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Plan;
use Illuminate\Support\Facades\Auth;
use Exception;

class PlanController extends Controller
{
    /**
     * Get all plans
     */
    public function index(Request $request)
    {
        try {
            $plans = Plan::all();
            return response(["message" => "success", "data" => $plans], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a single plan
     */
    public function show($id)
    {
        try {
            $plan = Plan::findOrFail($id);
            return response(["message" => "success", "data" => $plan], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Create a new plan
     */
    public function create(Request $request)
    {
        try {
            $validatedFields = $request->validate([
                "title" => "required|string",
                "description" => "string",
                "duration" => "required|integer",
                "color" => "string",
                "price" => "required|numeric",
            ]);
            $user = Auth::user();
            // $plan = Plan::create([
            //     "description" => "test",
            //     "duration" => 2,
            //     "price" => 200,
            //     "user_id" => 1,
            // ]);
            $plan = Plan::create([
                "description" => $validatedFields['description'],
                "title" => $validatedFields['title'],
                "duration" => $validatedFields['duration'],
                "price" => $validatedFields['price'],
                "color" => $validatedFields['color'],
                "user_id" => $user->id,
            ]);

            return response(["message" => "success", "data" => $plan], Response::HTTP_CREATED);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Update a plan
     */
    public function update(Request $request, $id)
    {
        try {
            $plan = Plan::findOrFail($id);
            $validatedFields = $request->validate([
                "title" => "string|nullable",
                "description" => "string|nullable",
                "duration" => "integer|nullable",
                "price" => "numeric|nullable",
                "color" => "string|nullable",
            ]);

            $plan->update(array_filter($validatedFields, fn($v) => !is_null($v)));
            return response(["message" => "success", "data" => $plan], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete a plan
     */
    public function delete($id)
    {
        try {
            $plan = Plan::findOrFail($id);
            $plan->delete();
            return response(["message" => "success"], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
