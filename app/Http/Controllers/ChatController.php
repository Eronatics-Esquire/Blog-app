<?php

namespace App\Http\Controllers;

use App\Http\Requests\MessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
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
        
        $users = User::where('id', '!=' , Auth::id())->get();

        $conversation = Auth()->user()
        ->conversations()
        ->with(['users', 'messages' => fn($q) => $q->latest()->limit(1)])
        ->get();

        return Inertia::render('components/Chat', [
        'conversations' => $conversation,
        'users' => $users,
        'messages' => [],
        'conversationId' => null,
// dd(Auth::user()->conversations()->with('users')->get());
    ]);
    }

    public function messages ($conversationId) {
        $conversation = Auth::user()
        ->conversations()->with('users')->findOrFail($conversationId);
        
        $conversations = Auth::user()
        ->conversations()
        ->with(['users', 'messages' => fn($q) => $q->latest()->limit(1)])
        ->get();


        $messages = Message::where('conversation_id', $conversationId)
        ->with('user')->oldest()->get();

        $users = User::where('id', '!=', Auth::id())->get();

        return Inertia('components/Chat',[
            'conversations' => $conversations,
            'users'          => $users,
            'messages' => $messages,
            'conversationId' => $conversation->id
        ]);

        
    }

    public function findOrCreate($userId){
        $authUser = Auth::user();

        $conversation = $authUser->conversations()
        ->whereHas('users', fn($q) => $q
        ->where('users.id', $userId))
        ->first();

        if(!$conversation){
            $conversation = Conversation::create();
            $conversation->users()->attach([$authUser->id, $userId]);
        }
        return redirect("/messages/{$conversation->id}");
    }
    public function send(Request $request)
{
    if (!$request->conversation_id) {
        return back()->with('error', 'Conversation ID is missing.');
    }

    Message::create([
        'conversation_id' => $request->conversation_id,
        'user_id' => Auth::id(),
        'message' => $request->message,
    ]);

    return redirect()->back();
}
    public function destroy(Message $message)
    {
        //
    }
}
