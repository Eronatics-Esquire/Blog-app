import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircleIcon, X, Send, ChevronLeft, Minus } from 'lucide-react';
import { useEchoPublic } from '@laravel/echo-react';
import { AvatarWithStatus } from './ui/avatar';
import { formatTimeAgo } from './ui/status-indicator';

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

const ChatBubble = ({
    message,
    isMe,
    showSeen,
}: {
    message: Message;
    isMe: boolean;
    showSeen: boolean;
}) => {
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
                    {isMe && showSeen && (
                        <>
                            {message.seen_at ? (
                                <span>Seen</span>
                            ) : (
                                <span>Sent</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

let authUserId: number | undefined;

export default function FloatingChat() {
    const { props } = usePage() as {
        props: { auth?: { user?: { id: number } } };
    };
    authUserId = props.auth?.user?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showList, setShowList] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollPositionRef = useRef(0);

    const channelId = activeChat?.id ? `chat.${activeChat.id}` : '';

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

    useEffect(() => {
        if (!isOpen || !showList) return;

        fetchConversations();
        const interval = setInterval(fetchConversations, POLLING_INTERVAL);
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
    };

    const otherUser = activeChat ? getOtherUser(activeChat, authUserId) : null;
    const lastMessage = messages[messages.length - 1];
    const showSeen = lastMessage?.user_id === authUserId;

    useEffect(() => {
        if (
            lastMessage &&
            lastMessage.user_id !== authUserId &&
            !lastMessage.seen_at
        ) {
            markAsSeen(lastMessage.id);
        }
    }, [lastMessage?.id]);

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
                                <div className="flex-1 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
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
                                            <div className="text-sm font-semibold text-gray-900">
                                                {otherUser?.name}
                                            </div>
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
                                                showSeen={showSeen}
                                            />
                                        ))}
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
        </div>
    );
}
