<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Notification $notification) {}

    public function broadcastOn()
    {
        // 🔥 PUBLIC CHANNEL
        return new Channel('notifications');
    }

    public function broadcastAs()
    {
        return 'new-notification';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notification->id,
            'user_id' => $this->notification->user_id,
            'type' => $this->notification->type,
            'sender' => [
                'id' => $this->notification->sender->id,
                'name' => $this->notification->sender->name,
                'avatar' => $this->notification->sender->profile_photo_url ?? null,
            ],
            'data' => $this->notification->data,
            'notifiable_type' => $this->notification->notifiable_type,
            'notifiable_id' => $this->notification->notifiable_id,
            'created_at' => $this->notification->created_at->toISOString(),
        ];
    }
}