<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostRequest;
use App\Models\Post;
use App\Services\PostServices;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(protected PostServices $postServices) {}

    public function index()
    {
        return $this->postServices->getAll();
    }

    public function store(PostRequest $request)
    {
        return $this->postServices->create($request->validated());

    }

    public function show(Post $post)
    {
        return Inertia::render('PostDetail', [
            'post' => $post->load(['user', 'reactions', 'comments.user']),
        ]);
    }

    public function update(PostRequest $request, Post $post)
    {
        return $this->postServices->updateAll($post, $request->validated());

    }

    public function destroy(Post $post)
    {
        return $this->postServices->deleteAll($post);
    }

    public function showAll()
    {
        return $this->postServices->showAll();
    }
}
