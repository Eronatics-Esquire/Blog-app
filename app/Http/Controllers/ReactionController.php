<?php

namespace App\Http\Controllers;

use App\Events\BroadcastEvent;
use App\Models\Post;
<<<<<<< Updated upstream
use App\Models\Reaction;
=======
use App\Services\ReactionService;
>>>>>>> Stashed changes
use Illuminate\Http\Request;

class ReactionController extends Controller
{
<<<<<<< Updated upstream
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

        }
    }
        $post->load('reactions');
=======
    public function __construct(protected ReactionService $reactionService) {}

    public function react(Request $request, Post $post)
    {
        $post = $this->reactionService->react($request, $post);
>>>>>>> Stashed changes
        broadcast(new BroadcastEvent(post: $post));

        return redirect()->back();
    }
<<<<<<< Updated upstream
=======

    public function reactComment(Request $request, Comment $comment)
    {
        $post = $this->reactionService->reactComment($request, $comment);
        $post?->load(['comments.user', 'comments.reactions']);
        broadcast(new BroadcastEvent(post: $post));

        return redirect()->back();
    }
>>>>>>> Stashed changes
}
