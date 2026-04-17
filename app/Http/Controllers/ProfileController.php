<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = User::where('id', $request->user()->id)
            ->with(['posts' => function ($query) {
                $query->with(['user', 'reactions', 'comments.user', 'images'])->latest();
            }])
            ->first();

        $user->friends_count = 0;
        $user->photos_count = $user->posts()->whereNotNull('image_path')->count();

        $user->posts->transform(function ($post) {
            $post->image_url = $post->image_path ? Storage::url($post->image_path) : null;
            $post->image_urls = $post->images->map(fn ($image) => Storage::url($image->path))->values();

            return $post;
        });

        return inertia('Profile', [
            'user' => array_merge($user->toArray(), [
                'avatar' => $user->profile_photo_url,
            ]),
        ]);
    }

    public function updateProfilePhoto(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = User::find($request->user()->id);
        $oldPhoto = $user->profile_photo;

        $path = $request->file('profile_photo')->store('profile-photos', 'public');
        $user->profile_photo = $path;
        $user->save();

        if ($oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return to_route('profile');
    }

    public function updateCoverPhoto(Request $request)
    {
        $request->validate([
            'cover_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $user = User::find($request->user()->id);
        $oldPhoto = $user->cover_photo;

        $path = $request->file('cover_photo')->store('cover-photos', 'public');
        $user->cover_photo = $path;
        $user->save();

        if ($oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return response()->json([
            'cover_photo_url' => Storage::url($path),
        ]);
    }

    public function viewProfile(Request $request, User $user)
    {
        $user = User::where('id', $user->id)
            ->with(['posts' => function ($query) {
                $query->with(['user', 'reactions', 'comments.user', 'images'])->latest();
            }])
            ->first();

        $isOwnProfile = Auth::id() === $user->id;

        $user->posts->transform(function ($post) {
            $post->image_url = $post->image_path ? Storage::url($post->image_path) : null;
            $post->image_urls = $post->images->map(fn ($image) => Storage::url($image->path))->values();

            return $post;
        });

        return inertia('Profile', [
            'user' => array_merge($user->toArray(), [
                'avatar' => $user->profile_photo_url,
            ]),
            'isOwnProfile' => $isOwnProfile,
        ]);
    }
}
