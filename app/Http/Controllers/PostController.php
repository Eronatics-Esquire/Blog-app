<?php

namespace App\Http\Controllers;

use App\Events\BroadcastEvent;
use App\Http\Requests\PostRequest;
use App\Models\Post;

use App\Services\PostServices;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostController extends Controller

{
    
    public function __construct(protected PostServices $postServices){}
    public function index()
    {    
        return $this->postServices->getAll();
    }

    public function store(PostRequest $request)
    {
       return $this->postServices->create($request->validated());
       
    }
    public function show()
    {
        return $this->postServices->showAll();
        
    }

    public function update(PostRequest $request, Post $post)
    {
        return $this->postServices->updateAll($post, $request->validated());
    
    }
    public function destroy(Post $post)
    {
        return $this->postServices->deleteAll($post);
    }
}
