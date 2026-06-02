<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('frontend');
})->where('any', '.*');
