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

    public ?int $post_id = null;
    public ?array $reaction_counts = null;
    public ?int $total_counts = null;

    public function __construct(
        public ?Post $post = null,
        public ?Comment $comment = null,
        public ?int $postId = null
    ) {
        if ($post) {
            $this->post_id = $post->id;
            $reactions = $post->reactions;
            $this->reaction_counts = $reactions->groupBy('reaction')
                ->map(fn($g) => $g->count())
                ->toArray();
            $this->total_counts = $reactions->count();
        }

        if ($comment) {
            $this->post_id = $comment->post_id;
        }

        // For deletion
        if (!$post && $postId) {
            $this->post_id = $postId;
        }
    }

    public function broadcastOn(): array
    {
        $channels = [];

        // All posts channel
        if ($this->post && !$this->comment) {
            $channels[] = new Channel('posts');
        }

        // Specific post channel for comments/reactions or deletion
        if ($this->comment || ($this->post && $this->reaction_counts !== null) || (!$this->post && $this->post_id)) {
            $channels[] = new Channel('posts.' . $this->post_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'BroadcastEvent';
    }
}