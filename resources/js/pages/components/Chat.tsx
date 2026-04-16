import { usePage, router, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import MessageInput from './MessageInput';
import { AvatarWithStatus } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/components/ui/status-indicator';

export default function Chat() {
    const {
        conversations,
        messages = [],
        conversationId,
        auth,
        users = [],
    } = usePage().props as any;

    const activeConversation = conversations?.find(
        (c: any) => c.id === conversationId,
    );

    const otherUser = activeConversation?.users.find(
        (u: any) => u.id !== auth.user.id,
    );

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
        <div className="flex h-screen">
            <div className="flex h-full w-80 flex-col border-r bg-white">
                <Link
                    href={'/dashboard'}
                    className="flex items-center gap-3 border-b p-4 font-bold"
                >
                    <svg className="size-8" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                    </svg>
                    Chats
                </Link>
                <div className="flex-1 overflow-y-auto">
                    {users.map((user: any) => {
                        const existingConvo = conversations?.find((c: any) =>
                            c.users.some((u: any) => u.id === user.id),
                        );
                        const lastMessage =
                            existingConvo?.messages?.[
                                existingConvo?.messages?.length - 1
                            ];
                        const isMe = lastMessage?.user_id === auth.user.id;
                        const preview = lastMessage
                            ? `${isMe ? 'You' : user.name}: ${lastMessage.message}`
                            : 'Start a chat';
                        const status = getUserStatus(user);

                        return (
                            <div
                                key={user.id}
                                onClick={() => {
                                    if (existingConvo) {
                                        router.get(
                                            `/messages/${existingConvo.id}`,
                                        );
                                    } else {
                                        router.post(
                                            `/messages/find-or-create/${user.id}`,
                                        );
                                    }
                                }}
                                className={`flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-100 ${
                                    existingConvo?.id === conversationId
                                        ? 'bg-gray-200'
                                        : ''
                                }`}
                            >
                                <AvatarWithStatus
                                    isOnline={user.is_online || false}
                                    lastSeenAt={user.last_seen_at}
                                    statusSize="md"
                                    size="md"
                                >
                                    {user.profile_photo ? (
                                        <img
                                            src={`/storage/${user.profile_photo}`}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[#0084ff] text-lg font-semibold text-white">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </AvatarWithStatus>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-gray-900">
                                        {user.name}
                                    </div>
                                    <div
                                        className={`text-xs ${user.is_online ? 'font-medium text-green-600' : 'text-gray-500'}`}
                                    >
                                        {status}
                                    </div>
                                    <div className="truncate text-xs text-gray-500">
                                        {preview}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex flex-1 flex-col bg-gray-100">
                {otherUser ? (
                    <>
                        <div className="flex items-center gap-3 border-b bg-white px-6 py-3">
                            <AvatarWithStatus
                                isOnline={otherUser.is_online || false}
                                lastSeenAt={otherUser.last_seen_at}
                                statusSize="sm"
                                size="sm"
                            >
                                {otherUser.profile_photo ? (
                                    <img
                                        src={`/storage/${otherUser.profile_photo}`}
                                        alt={otherUser.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-300 text-sm font-semibold text-gray-700">
                                        {otherUser.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}
                            </AvatarWithStatus>
                            <div>
                                <div className="font-semibold text-gray-900">
                                    {otherUser.name}
                                </div>
                                <div
                                    className={`text-xs ${otherUser.is_online ? 'font-medium text-green-600' : 'text-gray-500'}`}
                                >
                                    {getUserStatus(otherUser)}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto p-6">
                            {messages
                                .slice()
                                .reverse()
                                .map((msg: any) => {
                                    const mine = msg.user_id === auth.user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-md rounded-2xl px-4 py-2 ${
                                                    mine
                                                        ? 'bg-[#0084ff] text-white'
                                                        : 'bg-white text-gray-900 shadow-sm'
                                                }`}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="border-t bg-white p-4">
                            <MessageInput
                                key={conversationId}
                                conversationId={conversationId}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center text-gray-500">
                            <svg
                                className="mx-auto mb-4 h-16 w-16 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                            </svg>
                            <p className="text-lg font-medium">
                                Select a conversation
                            </p>
                            <p className="text-sm">
                                Choose from your existing conversations or start
                                a new one
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
