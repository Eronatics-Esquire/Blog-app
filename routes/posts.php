<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return redirect('/all-post');
})->middleware('auth');

Route::post('/dashboard', [PostController::class, 'store'])->middleware('auth');
Route::put('/posts/{post}', [PostController::class, 'update'])->middleware('auth');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show')->middleware('auth');
