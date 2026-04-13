<?php

namespace App\Http\Controllers;

use App\Events\BroadcastEvent;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReactionController extends Controller
{
    public function __construct(protected NotificationService $notificationService){}
    public function react(Request $request, Post $post)
    {
        if (!Auth()->check()){
            return redirect()->back();
        }
        // checheck nya if ang user ay nakapag react na
        $reaction = $post->reactions()
        ->where('user_id', Auth::id())
        ->first();

        if ($request->reaction === '' || $request->reaction === null) {
            // Delete reaction if user wants to remove it
            $reaction?->delete();
        } else {

        // dito ay pwede update ng user ang reaction na gusto nya
        if ($reaction) {
            $reaction->update([
                'reaction' => $request->reaction

            ]);
        } else {
            
        // ito naman ay dito na gagawa yung reaction if di pa naka react
         $post->reactions()->create([
            'user_id' => Auth::id(),
            'reaction' => $request->reaction
         ]);
            $this->notificationService->createReactionNotification(
                ['user_id' => Auth::id(), 'reaction' => $request->reaction],
                    'post_like',
                    $post
                );

        }
    }
        $post->load('reactions');
        broadcast(new BroadcastEvent(post: $post));

            return redirect()->back();
    }

    public function reactComment(Request $request, Comment $comment)
    {
        if (!Auth()->check()) {
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

        $post = $comment->post;
        $post?->load(['comments.user', 'comments.reactions']);
        broadcast(new BroadcastEvent(post: $post));

        return redirect()->back();
    }
}

