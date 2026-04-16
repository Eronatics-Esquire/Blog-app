import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    firstNameOnly = false,
}: {
    user?: User | null;
    showEmail?: boolean;
    firstNameOnly?: boolean;
}) {
    const getInitials = useInitials();
    const fullName = user?.name ?? 'Guest User';
    const firstName = user?.first_name || fullName.split(' ')[0];
    const displayName = firstNameOnly ? firstName : fullName;
    const email = user?.email ?? '';
    const avatar = user?.avatar;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                {showEmail && email && (
                    <span className="truncate text-xs text-muted-foreground">
                        {email}
                    </span>
                )}
            </div>
        </>
    );
}
