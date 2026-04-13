<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(protected Notification $notification){}

  
    public function broadcastOn()
    {
        return new PrivateChannel('App.Models.User.' . $this->notification->user_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notification->id,
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

    public function broadcastAs()
    {
        return 'new-notification';
    }
}
