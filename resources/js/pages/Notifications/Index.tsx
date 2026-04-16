import { router, usePage } from '@inertiajs/react';
import { BellIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        Echo: any;
    }
}

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

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
};

const AvatarContent = ({ name, src }: { name?: string; src?: string }) => {
    const imageSrc = src?.startsWith('/storage/') ? src : `/storage/${src}`;

    if (src) {
        return (
            <img
                src={imageSrc}
                alt={name || ''}
                className="h-full w-full object-cover"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-[#1877f2] text-sm font-semibold text-white">
            {name?.charAt(0).toUpperCase()}
        </div>
    );
};

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

        const fetchCount = () => {
            fetch('/api/notifications/count', {
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((data) => {
                    setUnreadCount(data.unreadCount || 0);
                })
                .catch(console.error);
        };

        fetchCount();
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
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data.notificationsList || []);
            })
            .catch(console.error);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            fetch('/api/notifications/count', {
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((data) => {
                    setUnreadCount(data.unreadCount || 0);
                })
                .catch(console.error);
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
            credentials: 'include',
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
            credentials: 'include',
        });

        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                read_at: n.read_at || new Date().toISOString(),
            })),
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h3 className="text-xl font-bold text-gray-900">
                            Notifications
                        </h3>
                        <button
                            onClick={markAllAsRead}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <BellIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <p className="text-base font-medium text-gray-500">
                                    No notifications yet
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    When someone interacts with your posts,
                                    you'll see it here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                        New
                                    </span>
                                </div>
                                {notifications
                                    .filter((n) => !n.read_at)
                                    .map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification,
                                                )
                                            }
                                        />
                                    ))}
                                {notifications.filter((n) => n.read_at).length >
                                    0 && (
                                    <>
                                        <div className="mt-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
                                            <span className="text-sm font-semibold text-gray-500">
                                                Earlier
                                            </span>
                                        </div>
                                        {notifications
                                            .filter((n) => n.read_at)
                                            .map((notification) => (
                                                <NotificationItem
                                                    key={notification.id}
                                                    notification={notification}
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification,
                                                        )
                                                    }
                                                />
                                            ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-2">
                        <button
                            onClick={() => {
                                router.visit('/notifications');
                                setIsOpen(false);
                            }}
                            className="w-full rounded-lg py-2.5 text-center text-sm font-semibold text-blue-600 transition-colors hover:bg-gray-100"
                        >
                            See all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const NotificationItem = ({
    notification,
    onClick,
}: {
    notification: NotificationItem;
    onClick: () => void;
}) => {
    const isUnread = !notification.read_at;
    const senderName = notification.sender?.name || 'Someone';

    const getNotificationText = () => {
        const message = notification.data.message || '';
        return message.replace(`${senderName} `, '');
    };

    return (
        <div
            onClick={onClick}
            className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-100 ${
                isUnread ? 'bg-blue-50/50' : 'bg-white'
            }`}
        >
            <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-white">
                    <AvatarContent
                        name={notification.sender?.name}
                        src={notification.sender?.avatar}
                    />
                </div>
                <div
                    className={`absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        notification.type === 'post_like' ||
                        notification.type === 'comment_like'
                            ? 'bg-blue-500 text-white'
                            : notification.type === 'comment' ||
                                notification.type === 'comment_reply'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                    }`}
                >
                    {notification.type === 'post_like' ||
                    notification.type === 'comment_like' ? (
                        <span className="text-xs">👍</span>
                    ) : notification.type === 'comment' ||
                      notification.type === 'comment_reply' ? (
                        <span className="text-xs">💬</span>
                    ) : (
                        <span className="text-xs">📄</span>
                    )}
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-gray-900">
                    <span className="font-semibold">{senderName}</span>{' '}
                    {getNotificationText()}
                </p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-600">
                        {formatTimeAgo(notification.created_at)}
                    </span>
                    {isUnread && (
                        <>
                            <span className="h-1 w-1 rounded-full bg-gray-400" />
                            <span className="text-xs text-blue-600">New</span>
                        </>
                    )}
                </div>
                {notification.data.comment_preview && (
                    <div className="mt-2 line-clamp-2 rounded-lg bg-gray-100 p-2 text-xs text-gray-600 italic">
                        &quot;{notification.data.comment_preview}&quot;
                    </div>
                )}
            </div>
            {isUnread && (
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
            )}
        </div>
    );
};
