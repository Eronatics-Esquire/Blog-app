<?php


namespace App\Services;

use App\Events\NewNotification;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;

class NotificationService
{      
    public function createPostNotification(Post $post): void
    {
        // Notify all followers or friends (simplified - notify everyone except creator)
        $users = User::where('id', '!=', $post->user_id)->get();
        
        foreach ($users as $user) {
            $notification = Notification::create([
                'user_id' => $user->id,
                'sender_id' => $post->user_id,
                'type' => 'new_post',
                'notifiable_type' => Post::class,
                'notifiable_id' => $post->id,
                'data' => json_encode([
                    'message' => "{$post->user->name} created a new post",
                    'post_preview' => substr($post->content ?? $post->caption ?? '', 0, 100),
                ])
            ]);
            
            broadcast(new NewNotification($notification))->toOthers();
        }
    }

    public function createCommentNotification(Comment $comment): void
    {
        $post = $comment->post;
        
        // Notify post owner if someone else commented
        if ($post->user_id !== $comment->user_id) {
            $notification = Notification::create([
                'user_id' => $post->user_id,
                'sender_id' => $comment->user_id,
                'type' => 'comment',
                'notifiable_type' => Comment::class,
                'notifiable_id' => $comment->id,
                'data' => [
                    'message' => "{$comment->user->name} commented on your post",
                    'comment_preview' => substr($comment->comment, 0, 100),
                    'post_id' => $post->id,
                ]
            ]);
            
            broadcast(new NewNotification($notification))->toOthers();
        }
        
        // Notify parent comment owner if this is a reply
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            if ($parentComment && $parentComment->user_id !== $comment->user_id) {
                $notification = Notification::create([
                    'user_id' => $parentComment->user_id,
                    'sender_id' => $comment->user_id,
                    'type' => 'comment_reply',
                    'notifiable_type' => Comment::class,
                    'notifiable_id' => $comment->id,
                    'data' => json_encode([
                        'message' => "{$comment->user->name} replied to your comment",
                        'comment_preview' => substr($comment->comment, 0, 100),
                        'post_id' => $post->id,
                    ])
                ]);
                
                broadcast(new NewNotification($notification))->toOthers();
            }
        }
    }

    public function createReactionNotification($reaction, string $type, $model): void
    {
        $ownerId = $model->user_id;
        
        // Don't notify if user reacts to their own content
        if ($ownerId === $reaction['user_id']) {
            return;
        }
        
        $notification = Notification::create([
            'user_id' => $ownerId,
            'sender_id' => $reaction['user_id'],
            'type' => $type,
            'notifiable_type' => get_class($model),
            'notifiable_id' => $model->id,
            'data' => json_encode([
                'message' => $this->getReactionMessage($type, $reaction['user_id'], $model),
                'reaction_type' => $reaction['reaction'],
            ])
        ]);
        
        broadcast(new NewNotification($notification))->toOthers();
    }

    private function getReactionMessage(string $type, int $senderId, $model): string
    {
        $sender = User::find($senderId);
        if ($type === 'post_like') {
            return "{$sender->name} reacted to your post";
        }
        return "{$sender->name} reacted to your comment";
    }

    public function markAsRead($notificationId, $userId): void
    {
        Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->update(['read_at' => now()]);
    }

    public function markAllAsRead($userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUserNotifications($userId, $limit = 20)
    {
        return Notification::with(['sender'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate($limit);
    }

    public function getUnreadCount($userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }
}