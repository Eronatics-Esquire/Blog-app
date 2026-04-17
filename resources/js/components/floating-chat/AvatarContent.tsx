import { Conversation } from './types';

type AvatarContentProps = {
    user?: Conversation['users'][0] | null;
    size?: 'sm' | 'md' | 'lg';
};

export function AvatarContent({ user, size = 'md' }: AvatarContentProps) {
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
}
