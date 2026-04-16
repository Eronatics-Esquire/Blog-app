<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/all-post', [PostController::class, 'showAll'])->name('all-post');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::get('/profile/{user}', [ProfileController::class, 'viewProfile'])->name('profile.view');
});

Route::post('/comments/{post}', [CommentController::class, 'store'])->name('comments.store');
Route::post('/posts/{post}/react', [ReactionController::class, 'react'])
    ->name('posts.react')
    ->middleware('auth');
Route::post('/comments/{comment}/react', [ReactionController::class, 'reactComment'])
    ->name('comments.react')
    ->middleware('auth');

Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/profile/update-profile-photo', [ProfileController::class, 'updateProfilePhoto']);
    Route::post('/profile/update-cover-photo', [ProfileController::class, 'updateCoverPhoto']);
});

require __DIR__.'/settings.php';
require __DIR__.'/posts.php';
require __DIR__.'/chats.php';
