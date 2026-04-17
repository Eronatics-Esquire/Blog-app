<?php

namespace App\Services;

use App\Events\BroadcastEvent;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostServices
{
    public function __construct(protected NotificationService $notificationService) {}

    public function getAll()
    {
        if (! Auth()->check()) {
            return redirect()->back();
        }
        $posts = Post::with(['user', 'images', 'comments.user', 'comments.reactions', 'reactions.user'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate();

        $posts->getCollection()->transform(function ($post) {
            $post->user_reaction = $post->reactions
                ->where('user_id', Auth::id())
                ->first()?->reaction ?? null;

            $post->reaction_counts = $post->reactions
                ->groupBy('reaction')
                ->map(fn ($group) => $group->count())
                ->toArray();

            $post->total_counts = $post->reactions->count();
            $post->image_url = $post->image_path ? Storage::url($post->image_path) : null;
            $post->image_urls = $post->images->map(fn ($image) => Storage::url($image->path))->values();

            $post->comments->transform(function ($comment) {
                $comment->user_reaction = $comment->reactions
                    ->where('user_id', Auth::id())
                    ->first()?->reaction ?? null;
                $comment->reaction_counts = $comment->reactions
                    ->groupBy('reaction')
                    ->map(fn ($group) => $group->count())
                    ->toArray();
                $comment->total_counts = $comment->reactions->count();

                return $comment;
            });

            return $post;
        });

        return Inertia::render('dashboard', [
            'posts' => $posts,
            'Auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function create(array $data)
    {
        if (! empty($data['image'])) {
            $path = $data['image']->store('posts', 'public');
            $data['image_path'] = 'posts/'.basename($path);
        }
        $images = $data['images'] ?? [];
        unset($data['image']);
        unset($data['images']);

        $post = Auth::user()->posts()->create($data);
        foreach ($images as $image) {
            $path = $image->store('posts', 'public');
            $post->images()->create([
                'path' => 'posts/'.basename($path),
            ]);
        }
        $this->notificationService->createPostNotification($post);

        $post->load('user', 'reactions', 'images');
        $post->image_url = $post->image_path ? asset($post->image_path) : null;
        $post->image_urls = $post->images->map(fn ($image) => asset($image->path))->values();
        broadcast(new BroadcastEvent(post: $post));

        return redirect()->back();
    }

    public function updateAll(Post $post, array $data)
    {
        if (! empty($data['image'])) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $path = $data['image']->store('posts', 'public');
            $data['image_path'] = 'posts/'.basename($path);
        }
        $images = $data['images'] ?? [];
        unset($data['image']);
        unset($data['images']);

        $post->update($data);
        if (! empty($images)) {
            foreach ($post->images as $existingImage) {
                Storage::disk('public')->delete($existingImage->path);
            }
            $post->images()->delete();

            foreach ($images as $image) {
                $path = $image->store('posts', 'public');
                $post->images()->create([
                    'path' => 'posts/'.basename($path),
                ]);
            }
        }

        $post->load('user', 'reactions', 'images');
        $post->image_url = $post->image_path ? Storage::url($post->image_path) : null;
        $post->image_urls = $post->images->map(fn ($image) => Storage::url($image->path))->values();
        broadcast(new BroadcastEvent(post: $post));

        return redirect()->back();
    }

    public function showAll()
    {
        $posts = Post::with(['user', 'images', 'comments.user', 'comments.reactions', 'reactions'])
            ->latest()
            ->paginate(5);

        $posts->getCollection()->transform(function ($post) {
            $post->user_reaction = $post->reactions
                ->where('user_id', Auth::id())
                ->first()?->reaction ?? null;
            $post->reaction_counts = $post->reactions
                ->groupBy('reaction')
                ->map(fn ($group) => $group->count())
                ->toArray();

            $post->total_counts = $post->reactions->count();
            $post->image_url = $post->image_path ? Storage::url($post->image_path) : null;
            $post->image_urls = $post->images->map(fn ($image) => Storage::url($image->path))->values();

            $post->comments->transform(function ($comment) {
                $comment->user_reaction = $comment->reactions
                    ->where('user_id', Auth::id())
                    ->first()?->reaction ?? null;
                $comment->reaction_counts = $comment->reactions
                    ->groupBy('reaction')
                    ->map(fn ($group) => $group->count())
                    ->toArray();
                $comment->total_counts = $comment->reactions->count();

                return $comment;
            });

            return $post;
        });

        return Inertia::render('AllPost', [
            'posts' => Inertia::scroll($posts),
        ]);
    }

    public function deleteAll(Post $post)
    {
        // Check if the current user owns the post
        if ($post->user_id !== Auth::id()) {
            abort(403, 'You are not allowed to delete this post.');
        }

        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }
        foreach ($post->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        // Delete reactions and comments
        $post->reactions()->delete();
        $post->comments()->delete();
        $post->images()->delete();
        $post->delete();

        // Broadcast deletion so all clients update
        broadcast(new BroadcastEvent(post: null, postId: $post->id));

        return back();
    }
}
