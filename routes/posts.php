<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

Route::post('/dashboard', [PostController::class, 'store'])->middleware('auth');
Route::put('/posts/{post}', [PostController::class, 'update'])->middleware('auth');
Route::get('/dashboard', function () {
    return Redirect::to('/all-post');
})->middleware('auth');
Route::get('/dashboard-old', [PostController::class, 'index'])->name('dashboard')->middleware('auth');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show')->middleware('auth');
