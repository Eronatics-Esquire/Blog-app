<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionService
{
    public function __construct(protected NotificationService $notificationService) {}

    public function react(Request $request, Post $post)
    {
        if (! Auth()->check()) {
            return redirect()->back();
        }

        $reaction = $post->reactions()
            ->where('user_id', Auth::id())
            ->first();

        if ($request->reaction === '' || $request->reaction === null) {
            $reaction?->delete();
        } else {
            if ($reaction) {
                $reaction->update([
                    'reaction' => $request->reaction,
                ]);
            } else {
                $post->reactions()->create([
                    'user_id' => Auth::id(),
                    'reaction' => $request->reaction,
                ]);
                $this->notificationService->createReactionNotification(
                    ['user_id' => Auth::id(), 'reaction' => $request->reaction],
                    'post_like',
                    $post
                );
            }
        }
        $post->load('reactions');

        return $post;
    }

    public function reactComment(Request $request, Comment $comment)
    {
        if (! Auth()->check()) {
            return redirect()->back();
        }

        $reaction = $comment->reactions()
            ->where('user_id', Auth::id())
            ->first();

        if ($request->reaction === '' || $request->reaction === null) {
            $reaction?->delete();
        } else {
            if ($reaction) {
                $reaction->update([
                    'reaction' => $request->reaction,
                ]);
            } else {
                $comment->reactions()->create([
                    'user_id' => Auth::id(),
                    'reaction' => $request->reaction,
                ]);
                $this->notificationService->createReactionNotification(
                    ['user_id' => Auth::id(), 'reaction' => $request->reaction],
                    'comment_like',
                    $comment
                );
            }
        }

        return $comment->post;
    }
}
