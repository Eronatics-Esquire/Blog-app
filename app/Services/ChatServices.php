<?php

namespace App\Services;

use App\Events\MessageSeenEvent;
use App\Events\NewMessageEvent;
use App\Events\TypingEvent;
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
        if (! Auth::check()) {
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

    public function findOrCreateChatForApi($userId)
    {
        $authUser = Auth::user();

        $conversation = $authUser->conversations()
            ->whereHas('users', fn ($q) => $q
                ->where('users.id', $userId))
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create();
            $conversation->users()->attach([$authUser->id, $userId]);
            $conversation = $authUser->conversations()
                ->where('conversations.id', $conversation->id)
                ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->latest()->limit(1)])
                ->first();
        }

        return response()->json(['conversation' => $conversation]);
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
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $userId = Auth::id();

        $deletedRecords = \App\Models\DeletedConversation::where('user_id', $userId)
            ->get()
            ->keyBy('conversation_id');

        $conversations = Auth::user()
            ->conversations()
            ->with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.first_name', 'users.last_name', 'users.profile_photo', 'users.is_online', 'users.last_seen_at'), 'messages' => fn ($q) => $q->orderBy('created_at', 'desc')->limit(20)])
            ->get()
            ->filter(function ($conversation) use ($userId, $deletedRecords) {
                $deletedAt = $deletedRecords[$conversation->id]?->deleted_at;

                if (! $deletedAt) {
                    return true;
                }

                $hasNewMessage = $conversation->messages
                    ->where('user_id', '!=', $userId)
                    ->where('created_at', '>=', $deletedAt)
                    ->isNotEmpty();

                return $hasNewMessage;
            })
            ->values();

        return response()->json(['conversations' => $conversations]);
    }

    public function getMessagesForApi($conversationId)
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $conversation = Auth::user()
            ->conversations()
            ->findOrFail($conversationId);

        $query = Message::where('conversation_id', $conversationId)
            ->with('user');

        $deletedRecord = \App\Models\DeletedConversation::where('user_id', Auth::id())
            ->where('conversation_id', $conversationId)
            ->first();

        if ($deletedRecord && $deletedRecord->deleted_at) {
            $query->where('created_at', '>=', $deletedRecord->deleted_at);
        }

        $messages = $query->oldest()->get();

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

    public function markMessageAsSeen($messageId)
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $message = Message::find($messageId);

        if (! $message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        $unreadMessages = Message::where('conversation_id', $message->conversation_id)
            ->whereNull('seen_at')
            ->where('user_id', '!=', Auth::id())
            ->get();

        foreach ($unreadMessages as $unreadMessage) {
            $unreadMessage->seen_at = now();
            $unreadMessage->save();

            event(new MessageSeenEvent(
                $message->conversation_id,
                $unreadMessage->id,
                Auth::id()
            ));
        }

        return response()->json(['success' => true]);
    }

    public function broadcastTyping(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (! $request->conversation_id) {
            return response()->json(['error' => 'Conversation ID is missing.'], 400);
        }

        event(new TypingEvent(
            $request->conversation_id,
            Auth::id(),
            Auth::user()->name
        ));

        return response()->json(['success' => true]);
    }

    public function getContactsWithPresence()
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $contacts = User::where('id', '!=', Auth::id())
            ->orderByDesc('is_online')
            ->orderByDesc('last_seen_at')
            ->get(['id', 'name', 'first_name', 'last_name', 'profile_photo', 'is_online', 'last_seen_at']);

        return response()->json(['contacts' => $contacts]);
    }

    public function deleteConversation($conversationId)
    {
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $conversation = Auth::user()
            ->conversations()
            ->find($conversationId);

        if (! $conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        \App\Models\DeletedConversation::firstOrCreate([
            'user_id' => Auth::id(),
            'conversation_id' => $conversationId,
        ], [
            'deleted_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}
