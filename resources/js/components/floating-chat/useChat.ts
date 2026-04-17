import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { Conversation, Message, TypingUser, Contact } from './types';
import {
    getCsrfToken,
    getOtherUser,
    POLLING_INTERVAL,
    TYPING_TIMEOUT,
} from './utils';

export function useChat() {
    const { props } = usePage() as {
        props: { auth?: { user?: { id: number } } };
    };
    const authUserId = props.auth?.user?.id;

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

    const activeChatRef = useRef(activeChat);
    activeChatRef.current = activeChat;

    const authUserRef = useRef(authUserId);
    authUserRef.current = authUserId;

    const channelId = activeChat?.id ? `chat.${activeChat.id}` : '';

    useEffect(() => {
        if (window.Echo && channelId) {
            console.log('Subscribing to channel:', channelId);
        }
    }, [channelId]);

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

    const fetchConversations = useCallback(() => {
        fetch('/api/conversations', {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setConversations(data.conversations || []))
            .catch(console.error);
    }, []);

    const fetchContacts = useCallback(() => {
        fetch('/api/contacts/presence', {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setContacts(data.contacts || []))
            .catch(console.error);
    }, []);

    const startConversation = useCallback(
        (userId: number) => {
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
        },
        [fetchConversations],
    );

    useEffect(() => {
        if (!isOpen || !showList) return;

        fetchConversations();
        fetchContacts();
        const interval = setInterval(() => {
            fetchConversations();
            fetchContacts();
        }, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [isOpen, showList, fetchConversations, fetchContacts]);

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

    const sendMessage = useCallback(() => {
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
    }, [newMessage, activeChat, isSending]);

    const sendTyping = useCallback(() => {
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
    }, [activeChat]);

    const markAsSeen = useCallback(
        (messageId: number) => {
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
        },
        [activeChat],
    );

    const openChat = useCallback((convo: Conversation) => {
        setActiveChat(convo);
        setIsOpen(true);
        setIsMinimized(false);
        setShowList(false);
        setTypingUsers([]);
    }, []);

    const handleBack = useCallback(() => {
        setShowList(true);
        setActiveChat(null);
        setTypingUsers([]);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setActiveChat(null);
        setShowList(true);
        setIsMinimized(false);
        setTypingUsers([]);
        setDeleteMenuOpen(false);
    }, []);

    const handleDeleteConversation = useCallback(() => {
        if (!activeChat) return;
        setDeleteMenuOpen(false);
        setDeleteDialogOpen(true);
    }, [activeChat]);

    const confirmDeleteConversation = useCallback(() => {
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
    }, [activeChat, handleClose]);

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
    }, [lastMessage?.id, lastMessage, authUserId, markAsSeen]);

    useEffect(() => {
        if (activeChat && messages.length > 0) {
            const unreadMessages = messages.filter(
                (msg) => msg.user_id !== authUserId && !msg.seen_at,
            );
            if (unreadMessages.length > 0) {
                markAsSeen(unreadMessages[unreadMessages.length - 1].id);
            }
        }
    }, [activeChat?.id, messages, authUserId, markAsSeen]);

    return {
        isOpen,
        setIsOpen,
        isMinimized,
        setIsMinimized,
        showList,
        conversations,
        contacts,
        activeChat,
        messages,
        newMessage,
        setNewMessage,
        typingUsers,
        isSending,
        deleteMenuOpen,
        setDeleteMenuOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        chatEndRef,
        chatScrollRef,
        scrollPositionRef,
        authUserId,
        otherUser,
        showSeen,
        openChat,
        handleBack,
        handleClose,
        handleDeleteConversation,
        confirmDeleteConversation,
        startConversation,
        sendMessage,
        sendTyping,
    };
}
