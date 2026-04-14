// resources/js/Components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { BellIcon } from 'lucide-react';

// TypeScript interfaces
interface NotificationSender {
    id: number;
    name: string;
    avatar?: string;
}

interface NotificationData {
    message: string;
    post_id?: number;
    comment_preview?: string;
    reaction_type?: string;
    post_preview?: string;
}

interface Notification {
    id: number;
    user_id: number;
    type: string;
    sender: NotificationSender;
    data: NotificationData;
    notifiable_type: string;
    notifiable_id: number;
    created_at: string;
    read_at: string | null;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
}

declare global {
    interface Window {
        Echo: any;
        Laravel: {
            user: {
                id: number;
            };
        };
    }
}

const NotificationBell: React.FC = () => {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.Echo || !auth?.user) return;

        const channel = window.Echo.channel('notifications');

        channel.listen('.new-notification', (e: any) => {
            console.log('🔥 REALTIME:', e);

            // ⚠️ IMPORTANT: filter user manually (public channel sends to everyone)
            if (e.user_id !== auth.user.id) return;

            setNotifications((prev) => [e, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            window.Echo.leaveChannel('notifications');
        };
    }, [auth?.user]);

    const fetchUnreadCount = () => {
        router.get(
            '/notifications/unread-count',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['unreadCount'],
                onSuccess: (page) => {
                    setUnreadCount(page.props.unreadCount as number);
                },
                onError: (errors) => {
                    console.error('Error fetching unread count:', errors);
                },
            },
        );
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications?per_page=5', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            const data = await response.json();
            setNotifications(data.notifications.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown && notifications.length === 0) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            // Mark notification as read using fetch API
            await fetch(`/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );

            // Navigate to the relevant page using Inertia router
            if (notification.notifiable_type.includes('Post')) {
                router.visit(`/posts/${notification.notifiable_id}`);
            } else if (notification.notifiable_type.includes('Comment')) {
                router.visit(
                    `/posts/${notification.data.post_id}#comment-${notification.notifiable_id}`,
                );
            }

            setShowDropdown(false);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string): string => {
        switch (type) {
            case 'comment':
            case 'comment_reply':
                return '💬';
            case 'post_like':
            case 'comment_like':
                return '👍';
            case 'new_post':
                return '📝';
            default:
                return '🔔';
        }
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleBellClick}
                className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                aria-label="Notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex min-w-[20px] translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs leading-none font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <BellIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className={`cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${
                                        !notification.read_at
                                            ? 'bg-blue-50 hover:bg-blue-100'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                <span className="text-xl">
                                                    {getNotificationIcon(
                                                        notification.type,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {notification.sender.name}
                                                </p>
                                                <span className="ml-2 text-xs whitespace-nowrap text-gray-500">
                                                    {formatTime(
                                                        notification.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {notification.data.message}
                                            </p>
                                            {notification.data
                                                .comment_preview && (
                                                <p className="mt-1 text-xs text-gray-500 italic">
                                                    "
                                                    {notification.data.comment_preview.substring(
                                                        0,
                                                        50,
                                                    )}
                                                    {notification.data
                                                        .comment_preview
                                                        .length > 50
                                                        ? '...'
                                                        : ''}
                                                    "
                                                </p>
                                            )}
                                        </div>
                                        {!notification.read_at && (
                                            <div className="flex-shrink-0">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 bg-gray-50 p-2">
                        <a
                            href="/notifications"
                            className="block py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit('/notifications');
                                setShowDropdown(false);
                            }}
                        >
                            See all notifications
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
