<?php


namespace App\Http\Controllers;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;
use App\Mail\otpMail;
use App\Models\ResetPass;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Exception;

class AuthController extends Controller
{
    /**
     * get the current user infos
     * @return current_user
     */
    public function user(){
        $authUser = Auth::user();
        $user = User::with("role")->find($authUser->id);
        return response(["user"=>$user],Response::HTTP_ACCEPTED);
    }

    /**login */
    public function login(Request $request){
        // if(!Auth::attempt($request->only(["username", "password"]))){
        if(!Auth::attempt(['username' => $request->input("username"), 'password' => $request->input("password"), 'active' => "1"])){
            if (!Auth::attempt(['email' => $request->input("username"), 'password' => $request->input("password"), 'active' => "1"])) {
                return response(["message" => "userName or password uncorrect!!!"], Response::HTTP_BAD_REQUEST);
            }
        }
        $userAuth = Auth::user();

        $token = $userAuth->createToken("token")->plainTextToken;
        // $cookie = cookie("jwt",$token, 60*24);
        $user = User::with("role")->find($userAuth->id);
        // return response(["message"=>"success","user"=>$user,"roles"=>$roles,"token"=>$token],Response::HTTP_ACCEPTED)->withCookie($cookie);
        return response(["message"=>"success","user"=>$user,"token"=>$token],Response::HTTP_ACCEPTED);
    }

    /**validate userName */
    public function validateUser(Request $request){
        $user = DB::table("users")
        ->where("username","=",$request->input("username"))
        ->orWhere("email","=",$request->input("username"))
        ->get(["email", "username", "name", "active"]);
        if (isset($user) && count($user) > 0 && $user[0]->active == "1") {
            return response(["user" => $user],Response::HTTP_ACCEPTED);
        }else{
            if (isset($user) && count($user) > 0 && $user[0]->active == "0") {
                return response(["message" => "your account is disable"],Response::HTTP_BAD_REQUEST);
            }
            return response(["message" => "username or Email uncorrect"],Response::HTTP_BAD_REQUEST);
        }
    }

    /**send verification code */
    public function sendVerCode(Request $request){
        // delete all code
        ResetPass::where("username", "=", $request->input("username"))->delete();
        //this function for sending verification code to the email
        $user = DB::table("users")
        ->where("username", "=", $request->input("username"))
        ->get(["email", "username", "name"]);
        if(!isset($user)){
            return response(["message" => "something wrong try agine"], Response::HTTP_BAD_REQUEST);
        }
        //generate otp 
        $otp = random_int(100000,999999);
        // config Mail
        $path = resource_path('js/settings.json');
        $data = null;
        if (File::exists($path)) {
            $content = File::get($path);
            $data = json_decode($content, true);
        } else {
            throw new Exception("file not found");
        }
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $data["emailSettings"]['host'],
            'port' => $data["emailSettings"]['port'],
            'encryption' => 'tls',
            'username' => $data["emailSettings"]['username'],
            'password' => $data["emailSettings"]['password'],
            'timeout' => null,
            'auth_mode' => null,
        ]);
        Config::set('mail.from', [
            'address' => $data["emailSettings"]['username'],
            'name' => $settings['businessInfo']['name'] ?? 'GYM App',
        ]);
        
        Mail::purge('smtp');
        //send mail
        Mail::mailer('smtp')->to($user[0]->email)->send(new otpMail($user[0]->name, $otp));
        //store data in resetpass table
        $datetime = date("Y-m-d H:i:s", strtotime('+2 hours'));
        ResetPass::create([
            'username' => $user[0]->username,
            'code'=> $otp,
            'expiration'=> $datetime
        ]);
        
        return response(["message" => "check your email"],Response::HTTP_ACCEPTED);
    }

    /**verify code */
    public function validateCode(Request $request){
        //this function for verify the code 
        $validateCode = DB::table("reset_passes")
        ->where("username","=",$request->input("username"))
        ->where("code","=",$request->input("code"))
        ->where("expiration",">",date(now()))
        ->get();
        if(isset($validateCode) && count($validateCode) >0){
            //generate token to reset password
            $user = User::where("username","=",$request->input("username"))->first();
            Auth::login($user);
            $userAuth = Auth::user();
            // $token = $user->createToken("token")->plainTextToken;
            // $cookie = cookie("jwt", $token, 60 * 24);
            // ResetPass::where("username", "=", $request->input("username"))->delete();
            // return response(["message"=>"Success","user"=>$user],Response::HTTP_OK)->withCookie($cookie);
            $token = $userAuth->createToken("token")->plainTextToken;
            $user = User::with("role")->find($userAuth->id);
            
            return response(["message"=>"success","user"=>$user,"token"=>$token],Response::HTTP_ACCEPTED);
        }
        return response(["message"=>"code invalide"],Response::HTTP_UNAUTHORIZED);
    }

    public function resetPassword(Request $request){
        try{
            $validateFields = $request->validate([
                "password" => "required"
            ]);
            //this for reset password
            $authUser = Auth::user();
            $user = User::find($authUser->id);
            $user->update([
                "password" => Hash::make($validateFields["password"])
            ]);
            return response(["message" => "password changed with success"], Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message"=>$err->getMessage()],Response::HTTP_BAD_REQUEST);
        }
    }

    public function logout(Request $request)
    {
        try {
            Auth::user()->currentAccessToken()->delete();
            return response(["message" => "logout with success","class"=>get_class($request->user()->currentAccessToken())], Response::HTTP_OK);
        } catch (Exception $err) {
            return response(["message" => $err], Response::HTTP_BAD_REQUEST);
        }
    }
}
