<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public int $conversationId;

    public function __construct(Message $message, int $conversationId)
    {
        $this->message = $message;
        $this->conversationId = $conversationId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('chat.'.$this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewMessageEvent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'message' => $this->message->message,
                'user_id' => $this->message->user_id,
                'conversation_id' => $this->message->conversation_id,
                'created_at' => $this->message->created_at->toIso8601String(),
                'user' => [
                    'id' => $this->message->user->id,
                    'name' => $this->message->user->name,
                ],
            ],
            'conversation_id' => $this->conversationId,
        ];
    }
}
