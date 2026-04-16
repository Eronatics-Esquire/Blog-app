import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircleIcon, X, Send, ChevronLeft, Minus } from 'lucide-react';
import { useEchoPublic } from '@laravel/echo-react';
import { AvatarWithStatus } from './ui/avatar';
import { formatTimeAgo } from './ui/status-indicator';
import { Dialog, DialogContent } from './ui/dialog';

const POLLING_INTERVAL = 30000;
const TYPING_TIMEOUT = 1000;

type Conversation = {
    id: number;
    users: Array<{
        id: number;
        name: string;
        profile_photo?: string;
        is_online?: boolean;
        last_seen_at?: string;
    }>;
    messages: Message[];
};

type Message = {
    id: number;
    message: string;
    user_id: number;
    created_at: string;
    seen_at?: string | null;
    user?: {
        id: number;
        name: string;
    };
};

type TypingUser = {
    userId: number;
    userName: string;
    timestamp: number;
};

const getCsrfToken = (): string => {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || ''
    );
};

const getOtherUser = (convo: Conversation, authUserId?: number) => {
    return convo.users?.find((u) => u.id !== authUserId);
};

const getUserStatus = (user: Conversation['users'][0] | undefined): string => {
    if (!user) return '';
    if (user.is_online) return 'Active now';
    if (user.last_seen_at) {
        return `Active ${formatTimeAgo(user.last_seen_at)}`;
    }
    return '';
};

const AvatarContent = ({
    user,
    size = 'md',
}: {
    user?: Conversation['users'][0] | null;
    size?: 'sm' | 'md' | 'lg';
}) => {
    if (
        user?.profile_photo &&
        typeof user.profile_photo === 'string' &&
        user.profile_photo.length > 0
    ) {
        return (
            <img
                src={`/storage/${user.profile_photo}`}
                alt={typeof user?.name === 'string' ? user.name : ''}
                className="h-full w-full object-cover"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        );
    }

    let initial = '?';
    if (
        user?.name &&
        typeof user.name === 'string' &&
        user.name.length > 0 &&
        user.name.length < 50
    ) {
        const firstChar = user.name.charAt(0);
        if (/[a-zA-Z]/.test(firstChar)) {
            initial = firstChar.toUpperCase();
        }
    }

    return (
        <div
            className={`flex h-full w-full items-center justify-center bg-[#0084ff] font-semibold text-white ${
                size === 'sm'
                    ? 'text-xs'
                    : size === 'md'
                      ? 'text-sm'
                      : 'text-base'
            }`}
        >
            {initial}
        </div>
    );
};

const TypingIndicator = () => (
    <div className="flex items-end gap-1 px-3">
        <div className="flex h-6 w-14 items-center justify-center rounded-full bg-gray-200">
            <div className="flex gap-0.5">
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                    style={{ animationDelay: '0ms' }}
                />
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                    style={{ animationDelay: '150ms' }}
                />
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
        </div>
    </div>
);

const ConversationListItem = ({
    convo,
    authUserId,
    onClick,
}: {
    convo: Conversation;
    authUserId?: number;
    onClick: () => void;
}) => {
    const otherUser = getOtherUser(convo, authUserId);
    const lastMsg = convo.messages?.[convo.messages.length - 1];
    const status = getUserStatus(otherUser);
    const isOnline = otherUser?.is_online;

    return (
        <div
            onClick={onClick}
            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
        >
            <AvatarWithStatus
                isOnline={isOnline || false}
                lastSeenAt={otherUser?.last_seen_at}
                statusSize="sm"
                size="md"
            >
                <AvatarContent user={otherUser} size="md" />
            </AvatarWithStatus>
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                        {typeof otherUser?.name === 'string' &&
                        otherUser.name.length > 0 &&
                        otherUser.name.length < 50 &&
                        /^[a-zA-Z]/.test(otherUser.name)
                            ? otherUser.name
                            : 'Unknown'}
                    </span>
                    {lastMsg?.created_at && (
                        <span className="text-xs text-gray-400">
                            {formatTimeAgo(lastMsg.created_at)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="truncate text-xs text-gray-500">
                        {lastMsg?.message || 'Start a conversation'}
                    </span>
                    {isOnline ? (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const ChatBubble = ({ message, isMe }: { message: Message; isMe: boolean }) => {
    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-2`}>
            <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    isMe
                        ? 'rounded-br-md bg-[#0084ff] text-white'
                        : 'rounded-bl-md border border-gray-200 bg-white text-gray-900 shadow-sm'
                }`}
            >
                <p className="text-sm">{message.message}</p>
                <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                        isMe ? 'text-white/70' : 'text-gray-400'
                    }`}
                >
                    <span>{time}</span>
                </div>
            </div>
        </div>
    );
};

let authUserId: number | undefined;

type Contact = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_photo?: string;
    is_online?: boolean;
    last_seen_at?: string;
};

export default function FloatingChat() {
    const { props } = usePage() as {
        props: { auth?: { user?: { id: number } } };
    };
    authUserId = props.auth?.user?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showList, setShowList] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollPositionRef = useRef(0);

    const channelId = activeChat?.id ? `chat.${activeChat.id}` : '';

    useEffect(() => {
        if (window.Echo && channelId) {
            console.log('Subscribing to channel:', channelId);
        }
    }, [channelId]);

    const activeChatRef = useRef(activeChat);
    activeChatRef.current = activeChat;

    const authUserRef = useRef(authUserId);
    authUserRef.current = authUserId;

    useEchoPublic(
        channelId,
        '.NewMessageEvent',
        (data: { conversation_id: number; message: Message }) => {
            if (
                activeChatRef.current &&
                data.conversation_id === activeChatRef.current.id &&
                data.message.user_id !== authUserRef.current
            ) {
                setMessages((prev) => [...prev, data.message]);
                setTypingUsers((prev) =>
                    prev.filter((u) => u.userId !== data.message.user_id),
                );
            }
        },
    );

    useEchoPublic(
        channelId,
        '.TypingEvent',
        (data: {
            conversation_id: number;
            user_id: number;
            user_name: string;
        }) => {
            if (data.user_id !== authUserRef.current) {
                setTypingUsers((prev) => {
                    const filtered = prev.filter(
                        (u) => u.userId !== data.user_id,
                    );
                    return [
                        ...filtered,
                        {
                            userId: data.user_id,
                            userName: data.user_name,
                            timestamp: Date.now(),
                        },
                    ];
                });

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUsers((prev) =>
                        prev.filter((u) => u.userId !== data.user_id),
                    );
                }, TYPING_TIMEOUT);
            }
        },
    );

    useEchoPublic(
        channelId,
        '.MessageSeenEvent',
        (data: {
            conversation_id: number;
            message_id: number;
            seen_by_user_id: number;
        }) => {
            console.log('MessageSeenEvent received:', data);
            if (
                activeChatRef.current &&
                data.conversation_id === activeChatRef.current.id
            ) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === data.message_id
                            ? { ...msg, seen_at: new Date().toISOString() }
                            : msg,
                    ),
                );
            }
        },
    );

    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const customEvent = e as CustomEvent<{
                conversation?: Conversation;
            }>;
            setIsOpen(true);
            setIsMinimized(false);

            if (customEvent.detail?.conversation) {
                setActiveChat(customEvent.detail.conversation);
                setShowList(false);
            } else {
                setShowList(true);
                setActiveChat(null);
            }
        };

        window.addEventListener('open-floating-chat', handleOpenChat);
        return () =>
            window.removeEventListener('open-floating-chat', handleOpenChat);
    }, []);

    const fetchConversations = () => {
        fetch('/api/conversations', {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setConversations(data.conversations || []))
            .catch(console.error);
    };

    const fetchContacts = () => {
        fetch('/api/contacts/presence', {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setContacts(data.contacts || []))
            .catch(console.error);
    };

    const startConversation = (userId: number) => {
        fetch(`/api/conversations/find-or-create/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.conversation) {
                    fetchConversations();
                    openChat(data.conversation);
                }
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (!isOpen || !showList) return;

        fetchConversations();
        fetchContacts();
        const interval = setInterval(() => {
            fetchConversations();
            fetchContacts();
        }, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [isOpen, showList]);

    useEffect(() => {
        if (!activeChat) return;

        fetch(`/api/conversations/${activeChat.id}/messages`, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                setMessages(data.messages || []);
                setShowList(false);
            })
            .catch(console.error);
    }, [activeChat?.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const sendMessage = () => {
        if (!newMessage.trim() || !activeChat || isSending) return;

        setIsSending(true);

        fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                conversation_id: activeChat.id,
                message: newMessage,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                setNewMessage('');
                setTypingUsers([]);
                return fetch(`/api/conversations/${activeChat.id}/messages`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });
            })
            .then((res) => res.json())
            .then((data) => setMessages(data.messages || []))
            .catch(console.error)
            .finally(() => setIsSending(false));
    };

    const sendTyping = () => {
        if (!activeChat) return;

        fetch('/api/typing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                conversation_id: activeChat.id,
            }),
        }).catch(console.error);
    };

    const markAsSeen = (messageId: number) => {
        if (!activeChat) return;

        console.log('Marking message as seen:', messageId);

        fetch(`/api/messages/${messageId}/seen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
            credentials: 'include',
        })
            .then(() => {
                window.dispatchEvent(
                    new CustomEvent('chat-messages-seen', {
                        detail: { conversationId: activeChat.id },
                    }),
                );
            })
            .catch(console.error);
    };

    const openChat = (convo: Conversation) => {
        setActiveChat(convo);
        setIsOpen(true);
        setIsMinimized(false);
        setShowList(false);
        setTypingUsers([]);
    };

    const handleBack = () => {
        setShowList(true);
        setActiveChat(null);
        setTypingUsers([]);
    };

    const handleClose = () => {
        setIsOpen(false);
        setActiveChat(null);
        setShowList(true);
        setIsMinimized(false);
        setTypingUsers([]);
        setDeleteMenuOpen(false);
    };

    const handleDeleteConversation = () => {
        if (!activeChat) return;
        setDeleteMenuOpen(false);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteConversation = () => {
        if (!activeChat) return;

        fetch(`/api/conversations/${activeChat.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(() => {
                setConversations((prev) =>
                    prev.filter((c) => c.id !== activeChat.id),
                );
                window.dispatchEvent(
                    new CustomEvent('chat-conversation-deleted', {
                        detail: { conversationId: activeChat.id },
                    }),
                );
                handleClose();
            })
            .catch(console.error);
        setDeleteDialogOpen(false);
    };

    const otherUser = activeChat ? getOtherUser(activeChat, authUserId) : null;
    const lastMessage = messages[messages.length - 1];
    const showSeen =
        lastMessage?.user_id === authUserId && !!lastMessage?.seen_at;

    useEffect(() => {
        if (
            lastMessage &&
            lastMessage.user_id !== authUserId &&
            !lastMessage.seen_at
        ) {
            markAsSeen(lastMessage.id);
        }
    }, [lastMessage?.id]);

    useEffect(() => {
        if (activeChat && messages.length > 0) {
            const unreadMessages = messages.filter(
                (msg) => msg.user_id !== authUserId && !msg.seen_at,
            );
            if (unreadMessages.length > 0) {
                markAsSeen(unreadMessages[unreadMessages.length - 1].id);
            }
        }
    }, [activeChat?.id]);

    return (
        <div className="fixed right-4 bottom-4 z-50">
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#0073e4]"
                >
                    <MessageCircleIcon className="h-7 w-7" />
                </button>
            )}

            {isOpen && (
                <div
                    className={`flex flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
                        isMinimized ? 'h-14 w-72' : 'h-[28rem] w-80'
                    }`}
                >
                    {/* Header */}
                    <div
                        className={`flex items-center justify-between rounded-t-2xl px-3 py-2 ${
                            isMinimized && activeChat
                                ? 'cursor-pointer bg-[#0084ff] hover:bg-[#0073e4]'
                                : 'bg-[#0084ff]'
                        }`}
                        onClick={() => {
                            if (isMinimized && activeChat) {
                                setIsMinimized(false);
                                setTimeout(() => {
                                    if (chatScrollRef.current) {
                                        chatScrollRef.current.scrollTop =
                                            scrollPositionRef.current;
                                    }
                                }, 50);
                            }
                        }}
                    >
                        <div className="flex items-center gap-2">
                            {!showList && activeChat && !isMinimized && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBack();
                                    }}
                                    className="text-white hover:text-gray-200"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            {isMinimized && activeChat && otherUser && (
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                                            <AvatarContent
                                                user={otherUser}
                                                size="sm"
                                            />
                                        </div>
                                        <span
                                            className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#0084ff] ${
                                                otherUser.is_online === true
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    </div>
                                    <span className="font-semibold text-white">
                                        {typeof otherUser.name === 'string' &&
                                        otherUser.name.length > 0 &&
                                        otherUser.name.length < 50 &&
                                        /^[a-zA-Z]/.test(otherUser.name)
                                            ? otherUser.name
                                            : 'User'}
                                    </span>
                                </div>
                            )}
                            {!isMinimized && (
                                <span className="font-semibold text-white">
                                    {showList
                                        ? 'Chats'
                                        : otherUser?.name &&
                                            typeof otherUser.name === 'string'
                                          ? otherUser.name
                                          : 'Chat'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {!isMinimized && activeChat && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (chatScrollRef.current) {
                                                scrollPositionRef.current =
                                                    chatScrollRef.current.scrollTop;
                                            }
                                            setIsMinimized(true);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteMenuOpen(
                                                    !deleteMenuOpen,
                                                );
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                            </svg>
                                        </button>
                                        {deleteMenuOpen && (
                                            <div className="absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteConversation();
                                                    }}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    Delete conversation
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <>
                            {/* Conversation List */}
                            {showList && (
                                <div className="flex h-full flex-col overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                                            No conversations yet
                                        </div>
                                    ) : (
                                        conversations.map((convo) => (
                                            <ConversationListItem
                                                key={convo.id}
                                                convo={convo}
                                                authUserId={authUserId}
                                                onClick={() => openChat(convo)}
                                            />
                                        ))
                                    )}

                                    {/* Start Conversation Section */}
                                    {contacts.length > 0 && (
                                        <div className="border-t">
                                            <div className="px-3 py-2">
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Start conversation
                                                </p>
                                            </div>
                                            {contacts
                                                .filter(
                                                    (contact) =>
                                                        contact.id !==
                                                            authUserId &&
                                                        !conversations.some(
                                                            (convo) =>
                                                                convo.users?.some(
                                                                    (u) =>
                                                                        u.id ===
                                                                        contact.id,
                                                                ),
                                                        ),
                                                )
                                                .slice(0, 5)
                                                .map((contact) => {
                                                    const contactName =
                                                        [
                                                            contact.first_name,
                                                            contact.last_name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ') ||
                                                        contact.name;
                                                    return (
                                                        <div
                                                            key={contact.id}
                                                            onClick={() =>
                                                                startConversation(
                                                                    contact.id,
                                                                )
                                                            }
                                                            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                                                        >
                                                            <div className="relative">
                                                                {contact.profile_photo ? (
                                                                    <img
                                                                        src={`/storage/${contact.profile_photo}`}
                                                                        alt={
                                                                            contactName
                                                                        }
                                                                        className="h-8 w-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0084ff] text-xs font-semibold text-white">
                                                                        {contactName
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <span
                                                                    className={`absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-white ${
                                                                        contact.is_online
                                                                            ? 'bg-green-500'
                                                                            : 'bg-gray-400'
                                                                    }`}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-700">
                                                                {contactName}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Active Chat */}
                            {!showList && activeChat && (
                                <>
                                    {/* Chat Header Info */}
                                    <div className="flex items-center gap-2 border-b px-3 py-2">
                                        <AvatarWithStatus
                                            isOnline={
                                                otherUser?.is_online || false
                                            }
                                            lastSeenAt={otherUser?.last_seen_at}
                                            statusSize="sm"
                                            size="sm"
                                        >
                                            <AvatarContent
                                                user={otherUser}
                                                size="sm"
                                            />
                                        </AvatarWithStatus>
                                        <div>
                                            <a
                                                href={`/profile/${otherUser?.id}`}
                                                className="text-sm font-semibold text-gray-900 hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {otherUser?.name}
                                            </a>
                                            <div className="text-xs text-gray-500">
                                                {otherUser?.is_online
                                                    ? 'Active now'
                                                    : otherUser?.last_seen_at
                                                      ? `Active ${formatTimeAgo(otherUser.last_seen_at)}`
                                                      : 'Offline'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div
                                        ref={chatScrollRef}
                                        className="flex-1 space-y-2 overflow-y-auto py-2"
                                    >
                                        {messages.map((msg) => (
                                            <ChatBubble
                                                key={msg.id}
                                                message={msg}
                                                isMe={
                                                    msg.user_id === authUserId
                                                }
                                            />
                                        ))}
                                        {showSeen && messages.length > 0 && (
                                            <div className="flex items-center justify-end px-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    {otherUser?.profile_photo ? (
                                                        <img
                                                            src={`/storage/${otherUser.profile_photo}`}
                                                            alt={
                                                                otherUser?.name ||
                                                                ''
                                                            }
                                                            className="h-5 w-5 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[8px] font-bold text-gray-600">
                                                            {otherUser?.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                '?'}
                                                        </div>
                                                    )}
                                                    <span>Seen</span>
                                                </div>
                                            </div>
                                        )}
                                        {typingUsers.length > 0 && (
                                            <TypingIndicator />
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="flex items-center gap-2 border-t px-3 py-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                sendTyping();
                                            }}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                sendMessage()
                                            }
                                            disabled={isSending}
                                            placeholder="Aa"
                                            className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:bg-gray-50 focus:outline-none disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={sendMessage}
                                            disabled={
                                                isSending || !newMessage.trim()
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0084ff] text-white hover:bg-[#0073e4] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Delete Conversation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-[400px] p-0">
                    <div className="p-4">
                        <h3 className="mb-2 text-center text-xl font-bold text-[#050505]">
                            Delete conversation?
                        </h3>
                        <p className="mb-6 text-center text-sm text-[#65676b]">
                            This conversation will be permanently deleted for
                            you. Others in the conversation won't be notified.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
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
        </div>
    );
}
