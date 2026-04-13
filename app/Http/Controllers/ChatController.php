<?php

namespace App\Http\Controllers;

use App\Http\Requests\MessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\ChatServices;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function __construct(protected ChatServices $chatServices){}
    public function index(){
        return $this->chatServices->getAllChat();
    }

    public function messages ($conversationId) {
        return $this->chatServices->allMessages($conversationId); 
    }

    public function findOrCreate($userId){
        return $this->chatServices->findOrCreateChat($userId);
    }
    public function send(Request $request){
        return $this->chatServices->sendAll($request);
    }
    public function destroy(Message $message)
    {
        
    }
}
