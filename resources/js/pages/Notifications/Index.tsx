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
        }
    }
}

declare global {
    interface Window {
        Echo: any;
        Laravel: {
            user: {
                id: number;
            }
        }
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
        fetchUnreadCount();
        
        // Listen for new notifications via Echo/Pusher
        if (window.Echo && auth?.user) {
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .listen('.new-notification', (e: { notification: Notification }) => {
                    setNotifications(prev => [e.notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Show browser notification if supported
                    if (Notification.permission === 'granted') {
                        new Notification('New Notification', {
                            body: e.notification.data.message,
                            icon: '/favicon.ico',
                        });
                    }
                });
        }

        // Request browser notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            if (window.Echo && auth?.user) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [auth?.user]);

    const fetchUnreadCount = () => {
        router.get('/notifications/unread-count', {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['unreadCount'],
            onSuccess: (page) => {
                setUnreadCount(page.props.unreadCount as number);
            },
            onError: (errors) => {
                console.error('Error fetching unread count:', errors);
            }
        });
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications?per_page=5', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => 
                prev.map(n => n.id === notification.id ? {...n, read_at: new Date().toISOString()} : n)
            );
            
            // Navigate to the relevant page using Inertia router
            if (notification.notifiable_type.includes('Post')) {
                router.visit(`/posts/${notification.notifiable_id}`);
            } else if (notification.notifiable_type.includes('Comment')) {
                router.visit(`/posts/${notification.data.post_id}#comment-${notification.notifiable_id}`);
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            setUnreadCount(0);
            setNotifications(prev => 
                prev.map(n => ({...n, read_at: new Date().toISOString()}))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string): string => {
        switch(type) {
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
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <BellIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.read_at ? 'bg-blue-50 hover:bg-blue-100' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-xl">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {notification.sender.name}
                                                </p>
                                                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                                    {formatTime(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.data.message}
                                            </p>
                                            {notification.data.comment_preview && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    "{notification.data.comment_preview.substring(0, 50)}
                                                    {notification.data.comment_preview.length > 50 ? '...' : ''}"
                                                </p>
                                            )}
                                        </div>
                                        {!notification.read_at && (
                                            <div className="flex-shrink-0">
                                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                        <a
                            href="/notifications"
                            className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
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