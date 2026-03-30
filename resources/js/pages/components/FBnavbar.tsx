import { Link, router } from '@inertiajs/react';

const FBnavbar = () => {
    return (
        <div className="flex items-center justify-center bg-white p-4">
            <div className="flex gap-4">
                <Link href="/dashboard" className="font-bold text-3xl text-blue-500">
                    Facebook
                </Link>
            </div>
        </div>
    );
};

export default FBnavbar;
