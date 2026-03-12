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
        if (!Auth()->check()){
            return redirect()->back();
        }
        // display yung post created at makakakita lang is yung user na gumawa
        $posts = Post::with(['user', 'comments.user', 'reactions.user'])

        ->latest()
        ->paginate();

        // didisplay neto yung mga reaction at yung sinelect na reaction
        // reaction ng current user
        $posts->getCollection()->transform(function ($post) {
            $post->user_reaction = $post->reactions
                ->where('user_id', Auth::id())
                ->first()?->reaction ?? null;

        $post->reaction_counts = $post->reactions
                ->groupBy('reaction')
                ->map(fn($group) => $group->count())
                ->toArray();

        $post->total_counts = $post->reactions->count();

            return $post;
        }); 

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
        $posts = Post::with(['user', 'comments.user', 'reactions'])
        ->latest()
        ->paginate();

        // didisplay neto yung mga reaction at yung sinelect na reaction
        $posts->getCollection()->transform(function ($post) {
            $post->user_reaction = $post->reactions
                ->where('user_id', Auth::id())
                ->first()?->reaction ?? null;
        $post->reaction_counts = $post->reactions
                ->groupBy('reaction')
                ->map(fn($group) => $group->count())
                ->toArray();

            $post->total_counts = $post->reactions->count();

            return $post;
        });

        return Inertia::render('AllPost',[
            'posts' => $posts
        ]);
    }

    public function update(PostRequest $request, Post $post)
    {
        //
    }


}
