<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeenEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;

    public int $messageId;

    public int $userId;

    public function __construct(
        int $conversationId,
        int $messageId,
        int $userId,
    ) {
        $this->conversationId = $conversationId;
        $this->messageId = $messageId;
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('chat.'.$this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSeenEvent';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'message_id' => $this->messageId,
            'user_id' => $this->userId,
        ];
    }
}
