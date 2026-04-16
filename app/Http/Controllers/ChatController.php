<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Services\ChatServices;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(protected ChatServices $chatServices) {}

    public function index()
    {
        return $this->chatServices->getAllChat();
    }

    public function messages($conversationId)
    {
        return $this->chatServices->allMessages($conversationId);
    }

    public function findOrCreate($userId)
    {
        return $this->chatServices->findOrCreateChat($userId);
    }

    public function send(Request $request)
    {
        return $this->chatServices->sendAll($request);
    }

    public function destroy(Message $message) {}

    public function apiConversations()
    {
        return $this->chatServices->getConversationsForApi();
    }

    public function apiMessages($conversationId)
    {
        return $this->chatServices->getMessagesForApi($conversationId);
    }

    public function apiSendMessage(Request $request)
    {
        return $this->chatServices->sendMessageForApi($request);
    }

    public function getContactsWithPresence()
    {
        return $this->chatServices->getContactsWithPresence();
    }
}
