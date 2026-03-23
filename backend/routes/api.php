<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\InstallationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StatisticsController;

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
// Authentication routes
Route::post('login', [AuthController::class, "login"]);
Route::post('validateUser', [AuthController::class, "validateUser"]);
Route::post('sendVerCode', [AuthController::class, "sendVerCode"]);
Route::post('validateCode', [AuthController::class, "validateCode"]);
Route::post('register', [UserController::class, "create"]);
Route::get('checkInstall', [InstallationController::class, "checkInstall"]);
Route::post('install', [InstallationController::class, "install"]);
Route::get('/test', function (Request $request) {
        return "hello from laravel api";
    });

Route::get('images/{filename}', function ($filename) {
    $path = storage_path('app/private/images/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }
    return response()->file($path);
});
// ============================================
// LOGGED ROUTES (Authentication Required)
// ============================================
Route::middleware('auth:sanctum')->group(function () {
    // User authentication routes
    Route::post('resetPassword', [AuthController::class, "resetPassword"]);
    Route::get('user', [AuthController::class, "user"]);
    Route::get('settings', [SettingsController::class, "getSettings"]);
    Route::get('logout', [AuthController::class, "logout"]);
    
    // Statistics route
    Route::get('/statistics', [StatisticsController::class, "index"]);
    
    // User resource routes
    Route::get('/users', [UserController::class, "index"]);
    Route::get('/users/{id}', [UserController::class, "show"]);
    Route::put('/users/{id}', [UserController::class, "update"]);
    
    // Customer management
    Route::get('/customers', [CustomerController::class, "index"]);
    Route::post('/customers', [CustomerController::class, "create"]);
    Route::post('/customers/update/{id}', [CustomerController::class, "update"]);
    Route::delete('/customers/{id}', [CustomerController::class, "delete"]);
    Route::get('/customers/details/{id}', [CustomerController::class, "getSingleCustomerDetails"]);
    Route::post('/customers/notify/pre-expire', [CustomerController::class, "notifyAllPreExpire"]);
    Route::post('/customers/notify/expired', [CustomerController::class, "notifyAllExpired"]);
    Route::post('/customers/notify/{id}', [CustomerController::class, "notifySingleCustomer"]);
    Route::get('/customers/{id}', [CustomerController::class, "show"]);
    Route::put('/customers/{id}', [CustomerController::class, "update"]);
    
    // Plan routes
    Route::get('/plans', [PlanController::class, "index"]);
    Route::get('/plans/{id}', [PlanController::class, "show"]);
    
    // Subscription routes
    Route::get('/subscriptions', [SubscriptionController::class, "index"]);
    Route::post('/subscriptions', [SubscriptionController::class, "create"]);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, "show"]);
    Route::post('/subscriptions/update/{id}', [SubscriptionController::class, "update"]);
    Route::delete('/subscriptions/{id}', [SubscriptionController::class, "delete"]);
    
    // Insurance routes
    Route::get('/insurances', [InsuranceController::class, "index"]);
    Route::post('/insurances', [InsuranceController::class, "create"]);
    Route::get('/insurances/{id}', [InsuranceController::class, "show"]);
    Route::post('/insurances/update/{id}', [InsuranceController::class, "update"]);
    Route::delete('/insurances/{id}', [InsuranceController::class, "delete"]);
    // Insurance management
    // Route::post('/insurances', [InsuranceController::class, "create"]);
    // Route::put('/insurances/{id}', [InsuranceController::class, "update"]);
    // Route::delete('/insurances/{id}', [InsuranceController::class, "delete"]);
    // Test route
    
});


// ============================================
// ADMIN ROUTES (Authentication + Admin Role Required)
// ============================================
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Role management
    Route::post('/roles', [RoleController::class, "create"]);
    Route::get('/roles', [RoleController::class, "index"]);
    Route::put('/roles/{id}', [RoleController::class, "update"]);
    Route::delete('/roles/{id}', [RoleController::class, "delete"]);
    
    // User management
    Route::delete('/users/{id}', [UserController::class, "delete"]);
    Route::post('/users', [UserController::class, "create"]);
    Route::post('/users/update/{id}', [UserController::class, "update"]);
    Route::get('/users/details/{id}', [UserController::class, "getSingleUserDetails"]);
    
    // Plan management
    Route::post('/plans', [PlanController::class, "create"]);
    Route::post('/plans/update/{id}', [PlanController::class, "update"]);
    Route::put('/plans/{id}', [PlanController::class, "update"]);
    Route::delete('/plans/{id}', [PlanController::class, "delete"]);
    
    

    // Settings management
    Route::post('/settings', [SettingsController::class, "updateSettings"]);
});
