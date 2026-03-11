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

    public function index()
    {    
        // display yung post created at makakakita lang is yung user na gumawa
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
        // create ng post yung user
        Auth::user()->posts()->create($request->validated());
        return redirect()->route('dashboard');
    }

    public function show(Post $post)
    {
        // di-display yung user post at comment
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
        // de-delete nya yung post kasama comment
        $post->comments()->delete();
        $post->delete();
        return redirect()->back();
    }
}
