import { router, usePage } from '@inertiajs/react';
import { BellIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface NotificationItem {
    id: number;
    user_id: number;
    type: string;
    sender: {
        id: number;
        name: string;
        avatar?: string;
    };
    data: {
        message: string;
        post_id?: number;
        comment_preview?: string;
        reaction_type?: string;
        post_preview?: string;
    };
    notifiable_type: string;
    notifiable_id: number;
    created_at: string;
    read_at: string | null;
}

declare global {
    interface Window {
        Echo: any;
    }
}

export default function NotificationBell() {
    const { auth } = usePage().props as {
        auth?: { user?: { id: number; name: string } };
    };
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!auth?.user) return;

        fetch('/api/notifications/count', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(console.error);
    }, [auth?.user]);

    useEffect(() => {
        if (!window.Echo || !auth?.user) return;

        const channel = window.Echo.channel('notifications');
        channel.listen('new-notification', (e: any) => {
            if (e.user_id !== auth.user?.id) return;

            const newNotification: NotificationItem = {
                id: e.id,
                user_id: e.user_id,
                type: e.type,
                sender: e.sender,
                data: e.data,
                notifiable_type: e.notifiable_type,
                notifiable_id: e.notifiable_id,
                created_at: e.created_at,
                read_at: null,
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            window.Echo.leaveChannel('notifications');
        };
    }, [auth?.user]);

    const loadNotifications = () => {
        fetch('/api/notifications/list', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data.notificationsList || []);
            })
            .catch(console.error);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            loadNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        fetch(`/api/notifications/${notification.id}/read`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
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

        const postId = notification.data.post_id || notification.notifiable_id;

        if (
            notification.type === 'comment' ||
            notification.type === 'comment_reply'
        ) {
            router.visit(
                `/all-post?post=${postId}&comment=${notification.notifiable_id}`,
            );
        } else if (
            notification.type === 'post_like' ||
            notification.type === 'comment_like'
        ) {
            if (notification.notifiable_type.includes('Comment')) {
                router.visit(
                    `/all-post?post=${postId}&comment=${notification.notifiable_id}`,
                );
            } else {
                router.visit(`/all-post?post=${postId}`);
            }
        } else if (notification.type === 'new_post') {
            router.visit(`/all-post?post=${notification.notifiable_id}`);
        } else {
            router.visit(`/all-post?post=${postId}`);
        }

        setIsOpen(false);
    };

    const markAllAsRead = () => {
        fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                'Content-Type': 'application/json',
            },
        });

        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                read_at: n.read_at || new Date().toISOString(),
            })),
        );
    };

    const getIcon = (type: string) => {
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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#e4e6eb] text-[#050505] transition-colors hover:bg-[#d8dadf] focus:outline-none"
            >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fa3e3e] px-1 text-xs font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#dcdcdc] bg-[#f5f6f7] p-3">
                        <h3 className="text-[17px] font-semibold text-[#050505]">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm font-medium text-[#216fdb] hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto scroll-smooth">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <BellIcon className="mx-auto mb-2 h-12 w-12 text-[#bec3c9]" />
                                <p className="text-sm text-[#65676b]">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className={`cursor-pointer p-3 transition-colors hover:bg-[#f2f2f2] ${!notification.read_at ? 'bg-[#e7f3ff] hover:bg-[#d9ebff]' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4e6eb]">
                                                <span className="text-xl">
                                                    {getIcon(notification.type)}
                                                </span>
                                            </div>
                                            {!notification.read_at && (
                                                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#1877f2] ring-2 ring-white" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm leading-5 text-[#050505]">
                                                <span className="font-semibold">
                                                    {notification.sender?.name}
                                                </span>{' '}
                                                {notification.data.message?.replace(
                                                    notification.sender?.name +
                                                        ' ',
                                                    '',
                                                )}
                                            </p>
                                            <span className="text-xs text-[#65676b]">
                                                {formatTime(
                                                    notification.created_at,
                                                )}
                                            </span>
                                            {notification.data
                                                .comment_preview && (
                                                <p className="mt-1 truncate rounded-lg bg-[#f0f2f5] px-2 py-1.5 text-xs text-[#65676b] italic">
                                                    &quot;
                                                    {
                                                        notification.data
                                                            .comment_preview
                                                    }
                                                    &quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-[#dcdcdc] p-2">
                        <button
                            onClick={() => {
                                router.visit('/notifications');
                                setIsOpen(false);
                            }}
                            className="w-full rounded-lg py-2.5 text-center text-sm font-semibold text-[#1877f2] hover:bg-[#f0f2f5]"
                        >
                            See all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
