import { Link, usePage } from '@inertiajs/react';
import { MessageCircleIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
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

export default function FBnavbar({ user }: Props) {
    const { props } = usePage() as any;
    const authUser = props.auth?.user;

    const [chatOpen, setChatOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const chatRef = useRef<HTMLDivElement>(null);

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
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [chatOpen]);

    useEffect(() => {
        if (chatOpen) {
            fetch('/api/conversations', {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => setConversations(data.conversations || []))
                .catch(console.error);
        }
    }, [chatOpen]);

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

    return (
        <div className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
            <Link href="/dashboard">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
            </Link>

            <Link
                href="/all-postuser "
                className="text-2xl font-bold text-[#1877F2]"
            >
                Facebook
            </Link>

            <div className="flex items-center gap-3">
                {/* Chat Dropdown */}
                <div className="relative" ref={chatRef}>
                    <button
                        type="button"
                        onClick={() => setChatOpen(!chatOpen)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                        <MessageCircleIcon className="h-5 w-5" />
                    </button>

                    {chatOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white shadow-lg">
                            <div className="flex items-center justify-between border-b border-[#dcdcdc] bg-[#f5f6f7] p-3">
                                <h3 className="text-[17px] font-semibold text-[#050505]">
                                    Chats
                                </h3>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
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
                                        return (
                                            <div
                                                key={convo.id}
                                                onClick={() =>
                                                    openChatInFloating(convo)
                                                }
                                                className="flex w-full cursor-pointer items-center gap-3 border-b border-[#dcdcdc] p-3 transition-colors hover:bg-[#f2f2f2]"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb] font-semibold text-[#050505]">
                                                    {otherUser?.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-sm font-semibold text-[#050505]">
                                                        {otherUser?.name}
                                                    </div>
                                                    <div className="truncate text-xs text-[#65676b]">
                                                        {lastMessage?.message ||
                                                            'Start a conversation'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2">
                            <UserInfo user={user} showEmail={false} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {user && <UserMenuContent user={user} />}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
