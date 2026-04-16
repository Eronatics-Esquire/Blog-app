<?php

namespace App\Services;

use App\Models\User;

class PresenceService
{
    public function userOnline(User $user): void
    {
        $user->setOnline(true);
    }

    public function userOffline(User $user): void
    {
        $user->setOnline(false);
    }

    public function markAllOffline(): void
    {
        User::where('is_online', true)->update([
            'is_online' => false,
            'last_seen_at' => now(),
        ]);
    }

    public function getOnlineUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('is_online', true)->get();
    }

    public function getUsersWithPresence(array $userIds): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereIn('id', $userIds)->get(['id', 'name', 'profile_photo', 'is_online', 'last_seen_at']);
    }
}
