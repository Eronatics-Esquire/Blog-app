<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // didisplay yung comments sa post ng user
        $comments = Comment::with(['user', 'post.user'])
        ->latest()->get();
        return Inertia::render('dashboard',[
            'comments' => $comments
        ]);
    }

     public function store(CommentRequest $request, $postId)
    {
        // checheck nya yung user if sya ba yung naka login. ito din yung pag gawa ng comment
        if (!Auth()->check()){
            return redirect()->back();
        }
        $post = Post::findOrFail($postId);

        $post->comments()->create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
            'comment' => $request->comment,
        ]);
    return redirect()->back();
    }

    public function update(Request $request, Comment $comment)
    {
        
    }

    public function destroy(Comment $comment)
    {
        //
    }
}
