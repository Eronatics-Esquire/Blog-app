<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSearchService
{
    public function search(Request $request)
    {
        if (! Auth::check()) {
            return ['users' => []];
        }

        $query = $request->get('q', '');

        if (strlen($query) < 1) {
            return ['users' => []];
        }

        $users = User::where('id', '!=', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'first_name', 'last_name', 'profile_photo', 'is_online', 'last_seen_at'])
            ->limit(10)
            ->get();

        return ['users' => $users];
    }
}
