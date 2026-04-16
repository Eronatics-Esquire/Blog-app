<?php

namespace App\Services;

use App\Events\NewMessageEvent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatServices
{
    public function getAllChat()
    {
        if (! Auth()->check()) {
            return redirect()->back();
        }

        $users = User::where('id', '!=', Auth::id())
            ->get(['id', 'name', 'profile_photo', 'is_online', 'last_seen_at']);

        $conversation = Auth::user()
            ->conversations()
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->get();

        return Inertia::render('components/Chat', [
            'conversations' => $conversation,
            'users' => $users,
            'messages' => [],
            'conversationId' => null,
        ]);
    }

    public function allMessages($conversationId)
    {
        $conversation = Auth::user()
            ->conversations()
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at')])
            ->findOrFail($conversationId);

        $conversations = Auth::user()
            ->conversations()
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->get();

        $messages = Message::where('conversation_id', $conversationId)
            ->with('user')->oldest()->get();

        $users = User::where('id', '!=', Auth::id())
            ->get(['id', 'name', 'profile_photo', 'is_online', 'last_seen_at']);

        return Inertia('components/Chat', [
            'conversations' => $conversations,
            'users' => $users,
            'messages' => $messages,
            'conversationId' => $conversation->id,
        ]);
    }

    public function findOrCreateChat($userId)
    {
        $authUser = Auth::user();

        $conversation = $authUser->conversations()
            ->whereHas('users', fn ($q) => $q
                ->where('users.id', $userId))
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create();
            $conversation->users()->attach([$authUser->id, $userId]);
        }

        return redirect("/messages/{$conversation->id}");
    }

    public function sendAll(Request $request)
    {
        if (! $request->conversation_id) {
            return response()->json(['error' => 'Conversation ID is missing.'], 400);
        }

        Message::create([
            'conversation_id' => $request->conversation_id,
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return response()->json(['success' => true]);
    }

    public function getConversationsForApi()
    {
        if (! Auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $conversations = Auth::user()
            ->conversations()
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->get();

        return response()->json(['conversations' => $conversations]);
    }

    public function getMessagesForApi($conversationId)
    {
        if (! Auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $conversation = Auth::user()
            ->conversations()
            ->findOrFail($conversationId);

        $messages = Message::where('conversation_id', $conversationId)
            ->with('user')
            ->oldest()
            ->get();

        return response()->json(['messages' => $messages, 'conversation' => $conversation]);
    }

    public function sendMessageForApi(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (! $request->conversation_id) {
            return response()->json(['error' => 'Conversation ID is missing.'], 400);
        }

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        $message->load('user');

        event(new NewMessageEvent($message, $request->conversation_id));

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function getContactsWithPresence()
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $contacts = User::where('id', '!=', Auth::id())
            ->orderByDesc('is_online')
            ->orderByDesc('last_seen_at')
            ->get(['id', 'name', 'profile_photo', 'is_online', 'last_seen_at']);

        return response()->json(['contacts' => $contacts]);
    }
}
