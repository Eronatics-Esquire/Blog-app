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
            'unreadCount' => $this->notificationService->getUnreadCount(Auth::id()),
        ]);
    }

    public function getList()
    {
        $notifications = $this->notificationService
            ->getUserNotifications(Auth::id(), 5);

        $items = collect($notifications->items())->map(function ($notification) {
            return [
                'id' => $notification->id,
                'user_id' => $notification->user_id,
                'type' => $notification->type,
                'sender' => [
                    'id' => $notification->sender?->id,
                    'name' => $notification->sender?->name,
                    'avatar' => $notification->sender?->profile_photo_url ?? null,
                ],
                'data' => $notification->data,
                'notifiable_type' => $notification->notifiable_type,
                'notifiable_id' => $notification->notifiable_id,
                'created_at' => $notification->created_at?->toISOString(),
                'read_at' => $notification->read_at?->toISOString(),
            ];
        });

        return response()->json([
            'notificationsList' => $items,
        ]);
    }
}
