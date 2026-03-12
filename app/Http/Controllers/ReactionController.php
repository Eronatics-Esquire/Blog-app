<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    public function react(Request $request, Post $post)
    {
        // $reaction = Reaction::where('user_id', Auth::id())
        //     ->where('post_id', $postId)
        //     ->first()->get();


        // checheck nya if ang user ay nakapag react na
        $reaction = $post->reactions()
        ->where('user_id', Auth::id())
        ->first();
        
        if ($request->reaction === '' || $request->reaction === null) {
        $reaction?->delete();
        return redirect()->back();
    }


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
            return redirect()->back();
    }
}

