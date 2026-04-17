import { Conversation } from './types';
import { AvatarContent } from './AvatarContent';

type ChatSeenStatusProps = {
    otherUser?: Conversation['users'][0] | null;
    showSeen: boolean;
};

export function ChatSeenStatus({ otherUser, showSeen }: ChatSeenStatusProps) {
    if (!showSeen) return null;

    return (
        <div className="flex items-center justify-end px-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
                {otherUser?.profile_photo ? (
                    <img
                        src={`/storage/${otherUser.profile_photo}`}
                        alt={otherUser?.name || ''}
                        className="h-5 w-5 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[8px] font-bold text-gray-600">
                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                )}
                <span>Seen</span>
            </div>
        </div>
    );
}
