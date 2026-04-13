<?php

namespace App\Http\Controllers;

use App\Events\BroadcastEvent;
use App\Http\Requests\CommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentServices;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function __construct(protected CommentServices $commentServices){}
    public function index(){
        return $this->commentServices->getAllComments();
    }
    

     public function store(CommentRequest $request, $postId){
        return $this->commentServices->storeAllComments($request, $postId);
    }

}
