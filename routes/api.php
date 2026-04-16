<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserSearchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/notifications/count', [NotificationController::class, 'getUnreadCount']);
    Route::get('/notifications/list', [NotificationController::class, 'getList']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    Route::get('/conversations', [ChatController::class, 'apiConversations']);
    Route::get('/conversations/{id}/messages', [ChatController::class, 'apiMessages']);
    Route::post('/conversations/find-or-create/{userId}', [ChatController::class, 'apiFindOrCreate']);
    Route::delete('/conversations/{id}', [ChatController::class, 'apiDeleteConversation']);
    Route::post('/messages/send', [ChatController::class, 'apiSendMessage']);
    Route::post('/messages/{id}/seen', [ChatController::class, 'apiMarkAsSeen']);
    Route::post('/typing', [ChatController::class, 'apiTyping']);
    Route::get('/contacts/presence', [ChatController::class, 'getContactsWithPresence']);

    Route::get('/users/search', [UserSearchController::class, 'search']);
});
