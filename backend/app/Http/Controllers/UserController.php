<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Insurance;
use App\Models\Plan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class UserController extends Controller
{
    /**
     * create user
     */
    public function create(Request $request){
        try{
            //register user 
            $validateFields = $request->validate([
                "name" => "required",
                "email" => "required|email",
                "username" => "required",
                "cin" => "string|nullable",
                "phone" => "string|nullable",
                "password" => "required",
                "role" => "required",
                "picture" => "image|nullable",
                "sexe" => "required"
            ]);
            //handle username already exist
            if (count(User::where("username", "=", $validateFields["username"])->get()) > 0) {
                throw new Exception("Username already exist");
            }
            //handle email already exist
            if (count(User::where(
                "email",
                "=",
                $validateFields["email"]
            )->get()) > 0) {
                throw new Exception("Email already exist");
            }
            //upload picture
            $pictureName="";
            if(isset($validateFields["picture"]) && !empty($validateFields["picture"])){
                $pictureName = parent::upload_picture($validateFields["picture"]);
            }
            $user = User::create([
                "name" => $validateFields["name"],
                "email" => $validateFields["email"],
                "username" => $validateFields["username"],
                "cin" => $validateFields["cin"],
                "phone" => $validateFields["phone"],
                "password" => Hash::make($validateFields["password"]),
                "role_id" => $validateFields["role"],
                "picture" => $pictureName,
                "sexe" => $validateFields["sexe"]
            ]);
            return response(["message" => "success", "data" => $user], Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function update(Request $request){
        try{
            $id = $request->route("id");
            $validateFields = $request->validate([
                "name" => "required",
                "email" => "required|email",
                "username" => "required",
                "cin" => "string|nullable",
                "phone" => "string|nullable",
                "password" => "nullable",
                "role" => "required",
                "active" => "required",
                "picture" => "image|nullable",
                "sexe" => "required"
            ]);
            $user  = User::find($id);
            
            // Check if username is already taken by another user
            if (User::where("username", $validateFields["username"])->where("id", "!=", $id)->exists()) {
                throw new Exception("Username already exists");
            }

            // Check if email is already taken by another user
            if (User::where("email", $validateFields["email"])->where("id", "!=", $id)->exists()) {
                throw new Exception("Email already exists");
            }

            // delete old picture if picture field is filled and upload the new one
            $pictureName = $user->picture;
            if(isset($validateFields["picture"]) && !empty($validateFields["picture"])){
                $pictureName = parent::update_picture($validateFields["picture"], $user);
            }

            $currentUser = Auth::user();
            
            // update user data
            $dataToUpdate = [
                "name" => $validateFields["name"],
                "email" => $validateFields["email"],
                "username" => $validateFields["username"],
                "cin" => $validateFields["cin"],
                "phone" => $validateFields["phone"],
                "picture" => $pictureName,
                "sexe" => $validateFields["sexe"]
            ];

            // Protect role and active status if editing self
            if ($currentUser->id != $user->id) {
                $dataToUpdate["role_id"] = $validateFields["role"];
                $dataToUpdate["active"] = $validateFields["active"];
            }

            $user->update($dataToUpdate);

            // check if the password seted
            if (isset($validateFields["password"]) && !empty($validateFields["password"])) {
                $user->update([
                    'password' => Hash::make($validateFields["password"])
                ]);
            }
            return response(["message" => "success", "data" => $user], Response::HTTP_OK); 
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    /**
     * delete function
     */
    public function delete(Request $request){
        try{
            $id = $request->route("id");
            $currentUser = Auth::user();
            $user = User::find($id);
            if ($currentUser->id == $user->id) {
                throw new Exception("you can't delete the connected user");
            }
            $this->delete_picture($user);
            $user->delete();
            return response(["message" => "success"], Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST); 
        }
    }
    /**
     * get all users (route handler)
     */
    public function index(Request $request){
        return $this->getAll($request);
    }

    /**
     * get all users
     */

    public function getAll(Request $request){
        try{
            $filter = $request->input('filter', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');
            $insuranceSub = DB::table('insurances')
                ->select('user_id', DB::raw('SUM(price) as totalInsurance'))
                ->when($filter == 'today', function ($q) {
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
                })
                ->groupBy('user_id');


            $subscriptionSub = DB::table('subscriptions')
                ->select('user_id', DB::raw('SUM(price) as total'))
                ->when($filter == 'today', function ($q) {
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
                })
                ->groupBy('user_id');


            $users = User::join('roles', 'users.role_id', '=', 'roles.id')
                ->leftJoinSub($insuranceSub, 'insurances_sum', function ($join) {
                    $join->on('users.id', '=', 'insurances_sum.user_id');
                })
                ->leftJoinSub($subscriptionSub, 'subscriptions_sum', function ($join) {
                    $join->on('users.id', '=', 'subscriptions_sum.user_id');
                })
                ->select(
                    'users.id as id',
                    'users.name as name',
                    'users.email as email',
                    'users.username as username',
                    'users.cin as cin',
                    'users.phone as phone',
                    'users.picture as picture',
                    'users.sexe as sexe',
                    'roles.title as role',
                    DB::raw('COALESCE(insurances_sum.totalInsurance,0) as totalInsurance'),
                    DB::raw('COALESCE(subscriptions_sum.total,0) as total')
                )
                ->get();
            return response(["message" => "success","data"=>$users], Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * reset password for a user
     * @param Request
     * @return response
     */
    public function reset_pass(Request $request){
        try{
            //validate field 
            $validateFields = $request->validate([
                "user_id" => "required",
                "password" => "required"
            ]);
            //update password
            User::where("id",$validateFields["user_id"])
            ->update(["password",Hash::make($validateFields["password"])]);
            //update return response
            return response(["message"=>"success"],Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    public function show(Request $request){
        try{
            $id = $request->route("id");
            //get user
            $user = User::where("users.id",$id)->join("roles","users.role_id","=","roles.id")->select("users.*","roles.id as role")->first();
            //return response
            return response(["message"=>"success","data"=>$user],Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * get single user details with stats and related records
     */
    public function getSingleUserDetails(Request $request, $id)
    {
        try {
            $filter = $request->input('filter', 'all');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            $user = User::with('role')->findOrFail($id);

            $applyFilter = function ($query) use ($filter, $startDate, $endDate) {
                return $query->when($filter == 'today', function ($q) {
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
            };

            // Fetch filtered stats
            $totalSubscriptions = $applyFilter(DB::table('subscriptions')->where('user_id', $id))->sum('price');
            $totalInsurances = $applyFilter(DB::table('insurances')->where('user_id', $id))->sum('price');
            $countSubscriptions = $applyFilter(DB::table('subscriptions')->where('user_id', $id))->count();

            // Fetch filtered records
            $subscriptions = $applyFilter(Subscription::with(['customer', 'plan'])->where('user_id', $id))->get();
            $insurances = $applyFilter(Insurance::with('customer')->where('user_id', $id))->get();

            return response([
                "message" => "success",
                "data" => [
                    "user" => $user,
                    "stats" => [
                        "totalSubscriptions" => $totalSubscriptions,
                        "totalInsurances" => $totalInsurances,
                        "countSubscriptions" => $countSubscriptions,
                    ],
                    "subscriptions" => $subscriptions,
                    "insurances" => $insurances
                ]
            ], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
