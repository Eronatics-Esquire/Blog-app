import { forwardRef } from 'react';
import { Send } from 'lucide-react';
import { formatTimeAgo } from '../ui/status-indicator';
import { AvatarWithStatus } from '../ui/avatar';
import { AvatarContent } from './AvatarContent';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatSeenStatus } from './ChatSeenStatus';
import { Conversation, Message, TypingUser } from './types';

type ChatPanelProps = {
    messages: Message[];
    typingUsers: TypingUser[];
    newMessage: string;
    onNewMessageChange: (value: string) => void;
    onSendMessage: () => void;
    onSendTyping: () => void;
    otherUser?: Conversation['users'][0] | null;
    authUserId?: number;
    showSeen: boolean;
    isSending: boolean;
    chatScrollRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(
    (
        {
            messages,
            typingUsers,
            newMessage,
            onNewMessageChange,
            onSendMessage,
            onSendTyping,
            otherUser,
            authUserId,
            showSeen,
            isSending,
            chatScrollRef,
        },
        ref,
    ) => {
        return (
            <>
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <AvatarWithStatus
                        isOnline={otherUser?.is_online || false}
                        lastSeenAt={otherUser?.last_seen_at}
                        statusSize="sm"
                        size="sm"
                    >
                        <AvatarContent user={otherUser} size="sm" />
                    </AvatarWithStatus>
                    <div>
                        <a
                            href={`/profile/${otherUser?.id}`}
                            className="text-sm font-semibold text-gray-900 hover:underline"
                            onClick={(e) => e.stopPropagation()}
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

                <div
                    ref={chatScrollRef}
                    className="flex-1 space-y-2 overflow-y-auto py-2"
                >
                    {messages.map((msg) => (
                        <ChatBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.user_id === authUserId}
                        />
                    ))}
                    <ChatSeenStatus otherUser={otherUser} showSeen={showSeen} />
                    {typingUsers.length > 0 && <TypingIndicator />}
                    <div ref={ref} />
                </div>

                <div className="flex items-center gap-2 border-t px-3 py-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            onNewMessageChange(e.target.value);
                            onSendTyping();
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        disabled={isSending}
                        placeholder="Aa"
                        className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:bg-gray-50 focus:outline-none disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={onSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0084ff] text-white hover:bg-[#0073e4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </>
        );
    },
);

ChatPanel.displayName = 'ChatPanel';
