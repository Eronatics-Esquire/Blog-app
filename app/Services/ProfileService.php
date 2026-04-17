<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function getProfile(Request $request)
    {
        $user = User::where('id', $request->user()->id)
            ->with(['posts' => function ($query) {
                $query->with(['user', 'reactions', 'comments.user'])->latest();
            }])
            ->first();

        $user->friends_count = 0;
        $user->photos_count = $user->posts()->whereNotNull('image_path')->count();

        return array_merge($user->toArray(), [
            'avatar' => $user->profile_photo_url,
        ]);
    }

    public function updateProfilePhoto(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = User::find($request->user()->id);
        $oldPhoto = $user->profile_photo;

        // Store sa disk root: public/storage/profile-photos/
        $path = $request->file('profile_photo')->store('profile-photos', 'public');
        $user->profile_photo = $path;
        $user->save();

        if ($oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return response()->json([
            'profile_photo_url' => Storage::url($user->profile_photo),
        ]);
    }

    public function updateCoverPhoto(Request $request)
    {
        $request->validate([
            'cover_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $user = User::find($request->user()->id);
        $oldPhoto = $user->cover_photo;

        // Store sa disk root: public/storage/cover-photos/
        $path = $request->file('cover_photo')->store('cover-photos', 'public');
        $user->cover_photo = $path;
        $user->save();

        if ($oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return response()->json([
            'cover_photo_url' => Storage::url($user->cover_photo),
        ]);
    }

    public function viewProfile(User $user)
    {
        $user = User::where('id', $user->id)
            ->with(['posts' => function ($query) {
                $query->with(['user', 'reactions', 'comments.user'])->latest();
            }])
            ->first();

        $isOwnProfile = Auth::id() === $user->id;

        return [
            'user' => array_merge($user->toArray(), [
                'avatar' => $user->profile_photo_url,
            ]),
            'isOwnProfile' => $isOwnProfile,
        ];
    }
}
