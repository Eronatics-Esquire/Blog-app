import { Link, usePage } from '@inertiajs/react';
import { MessageCircleIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import type { User } from '@/types';
import NotificationBell from '../Notifications/Index';

type Props = {
    user?: User | null;
};

type Conversation = {
    id: number;
    users: any[];
    messages: any[];
};

type SearchUser = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_photo: string | null;
    is_online: boolean;
};

const formatChatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
};

export default function FBnavbar({ user }: Props) {
    const { props } = usePage() as any;
    const authUser = props.auth?.user;

    const [chatOpen, setChatOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] =
        useState<Conversation | null>(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const confirmDeleteConversation = () => {
        if (!conversationToDelete) return;
        fetch(`/api/conversations/${conversationToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then(() => {
                setConversations((prev) =>
                    prev.filter((c) => c.id !== conversationToDelete.id),
                );
                setDeleteDialogOpen(false);
                setConversationToDelete(null);
            })
            .catch(console.error);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                chatRef.current &&
                !chatRef.current.contains(event.target as Node)
            ) {
                setChatOpen(false);
            }
        };

        if (chatOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [chatOpen]);

    useEffect(() => {
        if (!authUser?.id) return;

        let isCancelled = false;

        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/conversations', {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });

                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (isCancelled) return;
                const data = await res.json();
                const convos = (data.conversations || []).filter(
                    (convo: Conversation) =>
                        convo.messages && convo.messages.length > 0,
                );
                setConversations(convos);
                const unread = convos.reduce(
                    (count: number, convo: Conversation) => {
                        return (
                            count +
                            (convo.messages || []).filter(
                                (msg: any) =>
                                    msg.is_unread &&
                                    msg.user_id !== authUser?.id,
                            ).length
                        );
                    },
                    0,
                );
                setUnreadCount(unread);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            }
        };

        fetchConversations();
    }, [authUser?.id]);

    useEffect(() => {
        if (!authUser?.id) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/conversations', {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });

                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                const data = await res.json();
                const convos = (data.conversations || []).filter(
                    (convo: Conversation) =>
                        convo.messages && convo.messages.length > 0,
                );
                setConversations(convos);
                const unread = convos.reduce(
                    (count: number, convo: Conversation) => {
                        return (
                            count +
                            (convo.messages || []).filter(
                                (msg: any) =>
                                    msg.is_unread &&
                                    msg.user_id !== authUser?.id,
                            ).length
                        );
                    },
                    0,
                );
                setUnreadCount(unread);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [authUser?.id]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim().length < 1) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'include',
                    },
                );
                const data = await response.json();
                setSearchResults(data.users || []);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const openChatInFloating = (convo: Conversation) => {
        setChatOpen(false);
        window.dispatchEvent(
            new CustomEvent('open-floating-chat', {
                detail: { conversation: convo },
            }),
        );
    };

    const getOtherUser = (convo: Conversation) => {
        return convo.users?.find((u: any) => u.id !== authUser?.id);
    };

    const handleSearchResultClick = (userId: number) => {
        setSearchQuery('');
        setSearchResults([]);
        window.location.href = `/profile/${userId}`;
    };

    return (
        <>
            <div className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
                {/* Left section - Logo + Search */}
                <div className="flex items-center gap-3">
                    <Link href="/all-post">
                        <svg
                            className="h-10 w-10"
                            viewBox="0 0 24 24"
                            fill="#1877F2"
                        >
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                        </svg>
                    </Link>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="flex items-center rounded-full bg-gray-100 px-3 py-2">
                            <svg
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search Facebook"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ml-2 bg-transparent text-sm placeholder-gray-500 focus:outline-none"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.length >= 1 && (
                            <div className="absolute top-full left-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white shadow-lg">
                                <div className="max-h-80 overflow-y-auto">
                                    {searching && (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Searching...
                                        </div>
                                    )}
                                    {!searching &&
                                        searchResults.length === 0 && (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No results found for "
                                                {searchQuery}"
                                            </div>
                                        )}
                                    {!searching && searchResults.length > 0 && (
                                        <div className="py-2">
                                            <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase">
                                                People
                                            </p>
                                            {searchResults.map((result) => {
                                                const fullName =
                                                    [
                                                        result.first_name,
                                                        result.last_name,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ') ||
                                                    result.name;
                                                return (
                                                    <div
                                                        key={result.id}
                                                        onClick={() =>
                                                            handleSearchResultClick(
                                                                result.id,
                                                            )
                                                        }
                                                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-100"
                                                    >
                                                        <div className="relative h-10 w-10 flex-shrink-0">
                                                            {result.profile_photo ? (
                                                                <img
                                                                    src={`/storage/${result.profile_photo}`}
                                                                    alt={
                                                                        fullName
                                                                    }
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e6eb] font-semibold text-[#050505]">
                                                                    {(
                                                                        fullName.charAt(
                                                                            0,
                                                                        ) || '?'
                                                                    ).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <span
                                                                className={`absolute -right-0.5 -bottom-0.5 rounded-full border-2 border-white ${
                                                                    result.is_online
                                                                        ? 'bg-green-500'
                                                                        : 'bg-gray-400'
                                                                } h-3 w-3`}
                                                                style={{
                                                                    zIndex: 10,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="truncate text-sm font-medium text-[#050505]">
                                                                {fullName}
                                                            </p>
                                                            <p
                                                                className={`text-xs ${result.is_online ? 'text-green-600' : 'text-gray-500'}`}
                                                            >
                                                                {result.is_online
                                                                    ? 'Active now'
                                                                    : 'Offline'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center - Facebook text */}
                <div className="hidden md:block">
                    <Link
                        href="/all-post"
                        className="text-2xl font-bold text-[#1877F2]"
                    >
                        Facebook
                    </Link>
                </div>

                {/* Right section - Icons */}
                <div className="flex items-center gap-1">
                    {/* Chat Dropdown */}
                    <div className="relative" ref={chatRef}>
                        <button
                            type="button"
                            onClick={() => setChatOpen(!chatOpen)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                            <MessageCircleIcon className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fa3e3b] px-1 text-xs font-bold text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {chatOpen && (
                            <div className="absolute top-full right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-[#dcdcdc] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-[#dcdcdc] p-4">
                                    <h3 className="text-xl font-bold text-[#050505]">
                                        Chats
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                                            <svg
                                                className="h-5 w-5 text-[#65676b]"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="border-b border-[#dcdcdc] p-3">
                                    <div className="flex items-center rounded-full bg-[#f0f2f5] px-4 py-2">
                                        <svg
                                            className="h-4 w-4 text-[#65676b]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search conversations"
                                            className="ml-2 flex-1 bg-transparent text-sm text-[#050505] placeholder-[#65676b] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Chat List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f2f5]">
                                                <MessageCircleIcon className="h-8 w-8 text-[#65676b]" />
                                            </div>
                                            <p className="text-base font-medium text-[#65676b]">
                                                No conversations yet
                                            </p>
                                            <p className="mt-1 text-sm text-[#65676b]">
                                                Start chatting with friends
                                            </p>
                                        </div>
                                    ) : (
                                        conversations.map((convo) => {
                                            const otherUser =
                                                getOtherUser(convo);
                                            const lastMessage =
                                                convo.messages?.[0];
                                            const unreadMessages = (
                                                convo.messages || []
                                            ).filter(
                                                (msg: any) =>
                                                    msg.is_unread &&
                                                    msg.user_id !==
                                                        authUser?.id,
                                            ).length;
                                            const handleDelete = (
                                                e: React.MouseEvent,
                                            ) => {
                                                e.stopPropagation();
                                                setConversationToDelete(convo);
                                                setDeleteDialogOpen(true);
                                            };

                                            const confirmDeleteConversation =
                                                () => {
                                                    if (!conversationToDelete)
                                                        return;
                                                    fetch(
                                                        `/api/conversations/${conversationToDelete.id}`,
                                                        {
                                                            method: 'DELETE',
                                                            headers: {
                                                                'X-CSRF-TOKEN':
                                                                    document
                                                                        .querySelector(
                                                                            'meta[name="csrf-token"]',
                                                                        )
                                                                        ?.getAttribute(
                                                                            'content',
                                                                        ) || '',
                                                                'Content-Type':
                                                                    'application/json',
                                                            },
                                                            credentials:
                                                                'include',
                                                        },
                                                    )
                                                        .then((res) =>
                                                            res.json(),
                                                        )
                                                        .then(() => {
                                                            setConversations(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (c) =>
                                                                            c.id !==
                                                                            conversationToDelete.id,
                                                                    ),
                                                            );
                                                            setDeleteDialogOpen(
                                                                false,
                                                            );
                                                            setConversationToDelete(
                                                                null,
                                                            );
                                                        })
                                                        .catch(console.error);
                                                };
                                            return (
                                                <div
                                                    key={convo.id}
                                                    onClick={() =>
                                                        openChatInFloating(
                                                            convo,
                                                        )
                                                    }
                                                    className="group flex w-full cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-[#f2f2f2]"
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative">
                                                        {otherUser?.profile_photo ? (
                                                            <img
                                                                src={`/storage/${otherUser.profile_photo}`}
                                                                alt={
                                                                    otherUser?.name ||
                                                                    ''
                                                                }
                                                                className="h-14 w-14 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e4e6eb] text-lg font-semibold text-[#050505]">
                                                                {(
                                                                    otherUser?.name?.charAt(
                                                                        0,
                                                                    ) || '?'
                                                                ).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span
                                                            className={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white ${otherUser?.is_online === true ? 'bg-[#31a24c]' : 'bg-[#bcc0c4]'}`}
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[15px] font-semibold text-[#050505]">
                                                                {otherUser?.name ||
                                                                    'Unknown'}
                                                            </h4>
                                                            {lastMessage?.created_at && (
                                                                <span className="text-xs text-[#65676b]">
                                                                    {formatChatTime(
                                                                        lastMessage.created_at,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p
                                                                className={`truncate text-sm ${unreadMessages > 0 ? 'font-medium text-[#050505]' : 'text-[#65676b]'}`}
                                                            >
                                                                {lastMessage?.message ||
                                                                    'Start a conversation'}
                                                            </p>
                                                            {unreadMessages >
                                                                0 && (
                                                                <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1877f2] px-1.5 text-xs font-medium text-white">
                                                                    {
                                                                        unreadMessages
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Three dots menu */}
                                                    <button
                                                        onClick={handleDelete}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-600"
                                                        title="Delete conversation"
                                                    >
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-[#dcdcdc] p-3">
                                    <button className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-[#1877f2] hover:bg-[#f2f2f2]">
                                        <svg
                                            className="h-5 w-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                                        </svg>
                                        New message
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="ml-1 flex items-center gap-2">
                                <UserInfo
                                    user={user}
                                    showEmail={false}
                                    firstNameOnly
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {user && <UserMenuContent user={user} />}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-[400px] p-0">
                    <div className="p-4">
                        <h3 className="mb-2 text-center text-xl font-bold text-[#050505]">
                            Delete conversation?
                        </h3>
                        <p className="mb-6 text-center text-sm text-[#65676b]">
                            This conversation will be permanently deleted for
                            you. Others in the conversation won&apos;t be
                            notified.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setConversationToDelete(null);
                                }}
                                className="flex-1 rounded-lg border border-[#dadde1] bg-white py-2.5 text-[15px] font-semibold text-[#050505] transition-colors hover:bg-[#f0f2f5]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteConversation}
                                className="flex-1 rounded-lg bg-[#fa3e3b] py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#e3332d]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
