<?php

use App\Http\Controllers\ChatController;
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


Route::post('/comments/{post}', [CommentController  ::class, 'store'])->name('comments.store');
Route::post('/posts/{post}/react', [ReactionController::class, 'react'])
    ->name('posts.react')
    ->middleware('auth');
Route::post('/comments/{comment}/react', [ReactionController::class, 'reactComment'])
    ->name('comments.react')
    ->middleware('auth');




require __DIR__.'/settings.php';
require __DIR__.'/posts.php';
require __DIR__.'/chats.php';