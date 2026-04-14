<?php

namespace App\Services;

use App\Events\NewNotification;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;

class NotificationService
{
    // =====================
    // POST NOTIFICATION
    // =====================
    public function createPostNotification(Post $post): void
    {
        $users = User::where('id', '!=', $post->user_id)->get();

        foreach ($users as $user) {
            $notification = Notification::create([
                'user_id' => $user->id,
                'sender_id' => $post->user_id,
                'type' => 'new_post',
                'notifiable_type' => Post::class,
                'notifiable_id' => $post->id,
                'data' => [
                    'message' => "{$post->user->name} created a new post",
                    'post_preview' => substr($post->content ?? $post->caption ?? '', 0, 100),
                ]
            ]);

            broadcast(new NewNotification($notification));
        }
    }

    // =====================
    // COMMENT NOTIFICATION
    // =====================
    public function createCommentNotification(Comment $comment): void
    {
        $post = $comment->post;

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

           broadcast(new NewNotification($notification));
        }

        if ($comment->parent_id) {
            $parent = Comment::find($comment->parent_id);

            if ($parent && $parent->user_id !== $comment->user_id) {
                $notification = Notification::create([
                    'user_id' => $parent->user_id,
                    'sender_id' => $comment->user_id,
                    'type' => 'comment_reply',
                    'notifiable_type' => Comment::class,
                    'notifiable_id' => $comment->id,
                    'data' => [
                        'message' => "{$comment->user->name} replied to your comment",
                        'comment_preview' => substr($comment->comment, 0, 100),
                        'post_id' => $post->id,
                    ]
                ]);

                broadcast(new NewNotification($notification));
            }
        }
    }

    // =====================
    // REACTION NOTIFICATION
    // =====================
    public function createReactionNotification($reaction, string $type, $model): void
    {
        $ownerId = $model->user_id;

        if ($ownerId === $reaction['user_id']) return;

        $sender = User::find($reaction['user_id']);

        $notification = Notification::create([
            'user_id' => $ownerId,
            'sender_id' => $reaction['user_id'],
            'type' => $type,
            'notifiable_type' => get_class($model),
            'notifiable_id' => $model->id,
            'data' => [
                'message' => "{$sender->name} reacted",
                'reaction_type' => $reaction['reaction'],
                'post_id' => $model instanceof Post ? $model->id : ($model->post_id ?? null),
            ]
        ]);

        broadcast(new NewNotification($notification));
    }

    // =====================
    // MARK AS READ
    // =====================
    public function markAsRead($id, $userId): void
    {
        Notification::where('id', $id)
            ->where('user_id', $userId)
            ->update(['read_at' => now()]);
    }

    public function markAllAsRead($userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    // =====================
    // FETCH NOTIFICATIONS
    // =====================
    public function getUserNotifications($userId, $limit = 20)
    {
        return Notification::with('sender')
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