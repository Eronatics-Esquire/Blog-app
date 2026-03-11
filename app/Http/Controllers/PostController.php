<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostRequest;
use App\Models\Post;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with(['user', 'comments.user'])
        ->where('user_id', Auth::id())
        ->latest()
        ->paginate(10);

        return Inertia::render('dashboard',[
            'posts' => $posts,
            'Auth' => [
                'user' => Auth()->user(),
            ]
        ]);
    }

    public function store(PostRequest $request)
    {
        Auth::user()->posts()->create($request->validated());
        return redirect()->route('dashboard');
    }

    public function show(Post $post)
    {
        $posts = Post::with(['user', 'comments.user'])
        
        ->latest()
        ->paginate();

        return Inertia::render('AllPost',[
            'posts' => $posts
        ]);
    }

    public function update(PostRequest $request, Post $post)
    {
        //
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return redirect()->back();
    }
}
