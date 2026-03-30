import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { UserMenuContent } from '@/components/user-menu-content';

type Props = {
    user: User;
};

export default function FBnavbar({ user }: Props) {
    return (
        <div className="flex w-full items-center justify-between bg-white p-4">
            {/* Left side: Logo */}
            <Link href="/dashboard">
                <div className="ml-8 flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center">
                        <svg
                            className="h-10 w-10"
                            viewBox="0 0 24 24"
                            fill="#1877F2"
                        >
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                        </svg>
                    </div>
                </div>
            </Link>
            {/* Center: Facebook text */}
            <div className="flex flex-1 justify-center">
                <Link
                    href="/dashboard"
                    className="text-3xl font-bold text-blue-500"
                >
                    Facebook
                </Link>
            </div>

            {/* Right side: User dropdown */}
            <div className="mr-8 flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2">
                            <UserInfo user={user} showEmail={false} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
