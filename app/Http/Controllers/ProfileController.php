<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService) {}

    public function show(Request $request)
    {
        return inertia('Profile', [
            'user' => $this->profileService->getProfile($request),
        ]);
    }

    public function updateProfilePhoto(Request $request)
    {
        return $this->profileService->updateProfilePhoto($request);
    }

    public function updateCoverPhoto(Request $request)
    {
        return $this->profileService->updateCoverPhoto($request);
    }

    public function viewProfile(Request $request, User $user)
    {
        $data = $this->profileService->viewProfile($user);

        return inertia('Profile', $data);
    }
}
