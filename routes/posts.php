<?php

use App\Http\Controllers\PostController;



Route::post('/dashboard', [PostController::class, 'store'])->middleware('auth');
Route::put('/posts/{post}', [PostController::class, 'update'])->middleware('auth');
Route::get('/dashboard', [PostController::class, 'index'])->name('dashboard')->middleware('auth');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
Route::get('/posts', [PostController::class, 'show'])->name('posts.show');