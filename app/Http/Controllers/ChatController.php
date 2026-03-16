<?php

namespace App\Http\Controllers;

use App\Http\Requests\MessageRequest;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        if (!Auth()->check()){
        return redirect()->back();
    }


        $conversation = Auth()->user()
        ->conversations()
        ->with('users')
        ->get();

        return Inertia('components/Chat',[
            'conversations' => $conversation

        ]);
    }

    public function messages ($conversationId) {
        $conversation = Auth::user()
        ->conversations()->with('users')->findOrFail($conversationId);
        
        $conversations = Auth::user()
        ->conversations()->with('users')->get();

        $messages = Message::where('conversation_id', $conversationId)
        ->with('user')->latest()->get();

        return Inertia('components/Chat',[
            'conversations' => $conversations,
            'messages' => $messages,
            'activeConversation' => $conversation
        ]);
    }
    public function send (Request $request) {
        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'user_id' => Auth()->id(),
            'message' => $request->message

        ]);
        return $message->load('user');
    }
    public function destroy(Message $message)
    {
        //
    }
}
