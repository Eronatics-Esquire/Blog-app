<?php

use App\Http\Controllers\ChatController;



Route::get('/messages', [ChatController::class, 'index']);
Route::get('/messages/{conversationId}', [ChatController::class, 'messages']);
Route::post('/messages/send', [ChatController::class, 'send']);
Route::post('/messages/find-or-create/{userId}', [ChatController::class, 'findOrCreate']);