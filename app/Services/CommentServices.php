<?php

namespace App\Services;

use App\Events\BroadcastEvent;
use App\Http\Requests\CommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentServices
{
    public function __construct(protected NotificationService $notificationService) {}

    public function getAllComments()
    {
        // didisplay yung comments sa post ng user
        $comments = Comment::with(['user', 'post.user'])
            ->latest()->get();

        return Inertia::render('dashboard', [
            'comments' => $comments,
        ]);
    }

    public function storeAllComments(CommentRequest $request, $postId)
    {
        // checheck nya yung user if sya ba yung naka login. ito din yung pag gawa ng comment
        if (! Auth()->check()) {
            return redirect()->back();
        }
        $post = Post::findOrFail($postId);

        $comment = $post->comments()->create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'comment' => $request->comment,
            'parent_id' => $request->input('parent_id'),
        ]);
        $comment->load('user');
        broadcast(new BroadcastEvent(comment: $comment));
        $this->notificationService->createCommentNotification($comment);

        return redirect()->back();
    }
}
