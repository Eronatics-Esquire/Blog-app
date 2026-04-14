<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $notifications = $this->notificationService
            ->getUserNotifications(Auth::id(), $request->get('per_page', 5));

        // ✅ ALWAYS SAFE JSON FOR FETCH
        if ($request->expectsJson()) {
            return response()->json([
                'notifications' => $notifications
            ]);
        }

        return Inertia::render('Notifications/Index');
    }

    public function markAsRead($id)
    {
        $this->notificationService->markAsRead($id, Auth::id());

        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        $this->notificationService->markAllAsRead(Auth::id());

        return response()->json(['success' => true]);
    }

    public function getUnreadCount()
    {
        return response()->json([
            'unreadCount' => $this->notificationService->getUnreadCount(Auth::id())
        ]);
    }
}