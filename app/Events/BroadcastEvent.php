<?php

namespace App\Events;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BroadcastEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $post_id;
    public ?array $reaction_counts = null;
    public ?int $total_counts = null;

    public function __construct(
        public ?Post $post = null,
        public ?Comment $comment = null,
    ) {
        if ($post) {
            $reactions = $post->reactions;

            $this->post_id = $post->id;

            $this->reaction_counts = $reactions
                ->groupBy('reaction')
                ->map(fn($g) => $g->count())
                ->toArray();

            $this->total_counts = $reactions->count();
        }

        if ($comment) {
            $this->post_id = $comment->post_id;
        }
    }

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->post && !$this->comment) {
            $channels[] = new Channel('posts');
        }

        if ($this->comment || ($this->post && $this->reaction_counts !== null)) {
            $channels[] = new Channel('posts.' . $this->post_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'BroadcastEvent';
    }

    // public function broadcastWith(): array
    // {
    //     return [
    //         'post_id' => $this->post_id,
    //         'reaction_counts' => $this->reaction_counts,
    //         'total_counts' => $this->total_counts,
    //         'comment' => $this->comment,
    //     ];
    // }
}