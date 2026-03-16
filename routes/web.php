<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReactionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});


Route::post('/dashboard', [PostController::class, 'store'])->middleware('auth');
Route::get('/dashboard', [PostController::class, 'index'])->name('dashboard')->middleware('auth');
Route::post('/comments/{post}', [CommentController  ::class, 'store'])->name('comments.store');
Route::post('/posts/{post}/react', [ReactionController::class, 'react'])
    ->name('posts.react')
    ->middleware('auth');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
Route::get('/posts', [PostController::class, 'show'])->name('posts.show');
require __DIR__.'/settings.php';
