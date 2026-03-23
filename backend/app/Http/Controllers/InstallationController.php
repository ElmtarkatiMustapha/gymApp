<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;
use Exception;

class InstallationController extends Controller
{
    public function checkInstall()
    {
        try {
            $path = resource_path('js/settings.json');

            if (!File::exists($path)) {
                // File missing → app not installed
                return response([
                    "message" => "Settings file not found.",
                    "data" => ["installed" => false]
                ], Response::HTTP_OK);
            }

            // Read and decode JSON
            $settings = json_decode(File::get($path), true);

            // Safely get the installed value (default = false)
            $installed = $settings['installed'] ?? false;

            return response([
                "message" => "Installation status retrieved successfully.",
                "data" => ["installed" => (bool) $installed]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response([
                "message" => $e->getMessage(),
                "data" => ["installed" => false]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function install(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|email',
                'username' => 'required|string',
                'password' => 'required|string',
                // other validations handled manually to allow flexible frontend data
            ]);

            // Create or Update Admin User
            $admin = \App\Models\User::updateOrCreate(
                ['id' => 1],
                [
                    'name' => $request->name,
                    'email' => $request->email,
                    'username' => $request->username,
                    'password' => \Illuminate\Support\Facades\Hash::make($request->password),
                    'role_id' => 1,
                    'sexe' => 'male', // Default
                    'active' => 1,
                ]
            );

            // Update settings.json
            $path = resource_path('js/settings.json');
            $settings = [];
            if (File::exists($path)) {
                $settings = json_decode(File::get($path), true);
            }

            // Merge Business Info
            if ($request->has('businessInfo') && is_array($request->businessInfo)) {
                $settings['businessInfo'] = array_merge($settings['businessInfo'] ?? [], $request->businessInfo);
            }
            // Merge Email Settings
            if ($request->has('emailSettings') && is_array($request->emailSettings)) {
                $settings['emailSettings'] = array_merge($settings['emailSettings'] ?? [], $request->emailSettings);
            }
            // Merge Alert Settings
            if ($request->has('alertSettings') && is_array($request->alertSettings)) {
                $alertSettings = $request->alertSettings;
                // Ensure authNotice is boolean
                if (isset($alertSettings['autoNotice'])) {
                    $alertSettings['autoNotice'] = filter_var($alertSettings['autoNotice'], FILTER_VALIDATE_BOOLEAN);
                }
                $settings['alertSettings'] = array_merge($settings['alertSettings'] ?? [], $alertSettings);
            }
            // Merge Message Templates
            if ($request->has('messageTemplate') && is_array($request->messageTemplate)) {
                $settings['messageTemplate'] = array_merge($settings['messageTemplate'] ?? [], $request->messageTemplate);
            }
            // Merge Invoice Settings
            if ($request->has('invoiceSettings') && is_array($request->invoiceSettings)) {
                $settings['invoiceSettings'] = array_merge($settings['invoiceSettings'] ?? [], $request->invoiceSettings);
            }
            // Merge Insurance
            if ($request->has('insurance') && is_array($request->insurance)) {
                $settings['insurance'] = array_merge($settings['insurance'] ?? [], $request->insurance);
            }

            $settings['installed'] = true;

            File::put($path, json_encode($settings, JSON_PRETTY_PRINT));

            return response([
                "message" => "Installation completed successfully.",
                "data" => ["installed" => true]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response([
                "message" => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
