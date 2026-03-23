<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    //settings
    public function getSettings(Request $request){
        try{
            $path = resource_path('js/settings.json');
            $data = null;
            if (File::exists($path)) {
                $content = File::get($path);
                $data = json_decode($content, true);
            }else {
                throw new Exception("file not found");
            }
            return response(["message" => "success", "data" => $data], Response::HTTP_OK);
        }catch(Exception $err){
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function updateSettings(Request $request){
        try{
            $path = resource_path('js/settings.json');
            if (File::exists($path)) {
                $content = File::get($path);
                $data = json_decode($content, true);
                
                // Merge new data
                $newData = $request->all();
                
                // Handle businessInfo separately to merge sub-fields if necessary, 
                // or just merge as is if the request structure matches.
                // If businessInfo is a string (from FormData), decode it.
                if ($request->has('businessInfo') && is_string($request->input('businessInfo'))) {
                    $newData['businessInfo'] = json_decode($request->input('businessInfo'), true);
                }

                // Handle Logo Upload
                if ($request->hasFile('picture')) {
                    $picture = $request->file('picture');
                    $pictureName = time() . '.' . $picture->extension();
                    $picture->storeAs("images", $pictureName);
                    
                    // Delete old logo if exists
                    if (isset($data['businessInfo']['logo']) && !empty($data['businessInfo']['logo'])) {
                        Storage::delete("images/" . $data['businessInfo']['logo']);
                    }
                    
                    if (!isset($newData['businessInfo'])) {
                        $newData['businessInfo'] = $data['businessInfo'];
                    }
                    $newData['businessInfo']['logo'] = $pictureName;
                }

                $updatedData = array_merge($data, $newData);
                
                File::put($path, json_encode($updatedData, JSON_PRETTY_PRINT));
                return response(["message" => "Settings updated successfully", "data" => $updatedData], Response::HTTP_OK);
            } else {
                throw new Exception("Settings file not found");
            }
        } catch (Exception $err) {
            return response(["message" => $err->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
