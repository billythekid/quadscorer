<?php

use App\Http\Controllers\X01Controller;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('index');
});

Route::post('x01', X01Controller::class)->name('x01.create');
