import { formatTimeAgo } from '../ui/status-indicator';
import { AvatarWithStatus } from '../ui/avatar';
import { AvatarContent } from './AvatarContent';
import { Conversation } from './types';

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

type ConversationListItemProps = {
    convo: Conversation;
    authUserId?: number;
    onClick: () => void;
};

export function ConversationListItem({
    convo,
    authUserId,
    onClick,
}: ConversationListItemProps) {
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
}
