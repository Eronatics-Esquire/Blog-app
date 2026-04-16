import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircleIcon, X, Send, ChevronLeft } from 'lucide-react';
import { useEchoPublic } from '@laravel/echo-react';
import { AvatarWithStatus } from './ui/avatar';
import { formatTimeAgo } from './ui/status-indicator';

type Conversation = {
    id: number;
    users: any[];
    messages: any[];
};

type Message = {
    id: number;
    message: string;
    user_id: number;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
};

export default function FloatingChat() {
    const { props } = usePage() as any;
    const authUser = props.auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const [showList, setShowList] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const channelId = activeChat?.id ? `chat.${activeChat.id}` : '';

    const activeChatRef = useRef(activeChat);
    activeChatRef.current = activeChat;

    const authUserRef = useRef(authUser);
    authUserRef.current = authUser;

    useEchoPublic(channelId, '.NewMessageEvent', (data: any) => {
        if (
            activeChatRef.current &&
            data.conversation_id === activeChatRef.current.id &&
            data.message.user_id !== authUserRef.current?.id
        ) {
            setMessages((prev: Message[]) => [...prev, data.message]);
        }
    });

    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsOpen(true);
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
        })
            .then((res) => res.json())
            .then((data) => setConversations(data.conversations || []))
            .catch(console.error);
    };

    useEffect(() => {
        if (isOpen && showList) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen, showList]);

    useEffect(() => {
        if (activeChat) {
            fetch(`/api/conversations/${activeChat.id}/messages`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => {
                    setMessages(data.messages || []);
                    setShowList(false);
                })
                .catch(console.error);
        }
    }, [activeChat]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChat]);

    const sendMessage = () => {
        if (!newMessage.trim() || !activeChat) return;

        fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                conversation_id: activeChat.id,
                message: newMessage,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                setNewMessage('');
                fetch(`/api/conversations/${activeChat.id}/messages`, {
                    headers: { Accept: 'application/json' },
                })
                    .then((res) => res.json())
                    .then((data) => setMessages(data.messages || []));
            })
            .catch(console.error);
    };

    const openChat = (convo: Conversation) => {
        setActiveChat(convo);
        setIsOpen(true);
        setShowList(false);
    };

    const getOtherUser = (convo: Conversation) => {
        return convo.users?.find((u: any) => u.id !== authUser?.id);
    };

    const getUserStatus = (user: any) => {
        if (user?.is_online) {
            return 'Active now';
        }
        if (user?.last_seen_at) {
            return `Active ${formatTimeAgo(user.last_seen_at)}`;
        }
        return '';
    };

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
                <div className="flex h-[500px] w-80 flex-col rounded-xl border border-gray-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between rounded-t-xl bg-[#0084ff] px-4 py-3">
                        <div className="flex items-center gap-2">
                            {!showList && activeChat && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowList(true);
                                        setActiveChat(null);
                                    }}
                                    className="text-white hover:text-gray-200"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            <span className="font-semibold text-white">
                                {showList
                                    ? 'Chats'
                                    : getOtherUser(activeChat!)?.name || 'Chat'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setActiveChat(null);
                                setShowList(true);
                            }}
                            className="text-white hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {showList && (
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((convo) => {
                                    const otherUser = getOtherUser(convo);
                                    const lastMessage =
                                        convo.messages?.[
                                            convo.messages.length - 1
                                        ];
                                    const status = getUserStatus(otherUser);

                                    return (
                                        <div
                                            key={convo.id}
                                            onClick={() => openChat(convo)}
                                            className="flex w-full cursor-pointer items-center gap-3 border-b p-3 hover:bg-gray-100"
                                        >
                                            <AvatarWithStatus
                                                isOnline={
                                                    otherUser?.is_online ||
                                                    false
                                                }
                                                lastSeenAt={
                                                    otherUser?.last_seen_at
                                                }
                                                statusSize="md"
                                                size="md"
                                            >
                                                {otherUser?.profile_photo ? (
                                                    <img
                                                        src={`/storage/${otherUser.profile_photo}`}
                                                        alt={
                                                            otherUser?.name ||
                                                            ''
                                                        }
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-[#0084ff] text-lg font-semibold text-white">
                                                        {otherUser?.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </AvatarWithStatus>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[15px] font-semibold text-gray-900">
                                                        {otherUser?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {otherUser?.is_online ? (
                                                        <span className="text-xs font-medium text-green-600">
                                                            {status}
                                                        </span>
                                                    ) : otherUser?.last_seen_at ? (
                                                        <span className="text-xs text-gray-500">
                                                            {status}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {lastMessage?.message ||
                                                        'Start a conversation'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {!showList &&
                        activeChat &&
                        (() => {
                            const otherUser = getOtherUser(activeChat);
                            const status = getUserStatus(otherUser);

                            return (
                                <>
                                    <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-2">
                                        <AvatarWithStatus
                                            isOnline={
                                                otherUser?.is_online || false
                                            }
                                            lastSeenAt={otherUser?.last_seen_at}
                                            statusSize="sm"
                                            size="sm"
                                        >
                                            {otherUser?.profile_photo ? (
                                                <img
                                                    src={`/storage/${otherUser.profile_photo}`}
                                                    alt={otherUser?.name || ''}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#0084ff] text-sm font-semibold text-white">
                                                    {otherUser?.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                        </AvatarWithStatus>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {otherUser?.name}
                                            </div>
                                            <div
                                                className={`text-xs ${otherUser?.is_online ? 'font-medium text-green-600' : 'text-gray-500'}`}
                                            >
                                                {status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                                        {messages.map((msg) => {
                                            const isMe =
                                                msg.user_id === authUser?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-[#0084ff] text-white' : 'bg-gray-200 text-gray-900'}`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="flex gap-2 border-t p-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                sendMessage()
                                            }
                                            placeholder="Type a message..."
                                            className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0084ff] focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={sendMessage}
                                            className="rounded-full bg-[#0084ff] p-2 text-white hover:bg-[#0073e4]"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                </div>
            )}
        </div>
    );
}
