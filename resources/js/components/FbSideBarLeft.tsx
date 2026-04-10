import React from 'react';
import { Calendar, Clock3, Film, Users } from 'lucide-react';

type NavItem = {
    label: string;
    icon: React.ReactNode;
};

const CircleIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700">
        {children}
    </div>
);

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Aaron Castaneda',
        icon: (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-sm font-semibold text-white">
                A
            </div>
        ),
    },
    { label: 'Watch', icon: <CircleIcon><Film className="h-5 w-5" /></CircleIcon> },
    { label: 'Events', icon: <CircleIcon><Calendar className="h-5 w-5" /></CircleIcon> },
    { label: 'Friends', icon: <CircleIcon><Users className="h-5 w-5" /></CircleIcon> },
    { label: 'Memories', icon: <CircleIcon><Clock3 className="h-5 w-5" /></CircleIcon> },
];

const SHORTCUT_ITEMS = [
    {
        label: 'Undiscovered Eats',
        img: 'https://picsum.photos/seed/eats/36/36',
    },
    { label: 'Weekend Trips', img: 'https://picsum.photos/seed/trips/36/36' },
    {
        label: "Jasper's Market",
        img: 'https://picsum.photos/seed/jasper/36/36',
    },
    {
        label: 'Red Table Talk Group',
        img: 'https://picsum.photos/seed/redtable/36/36',
    },
    {
        label: 'Best Hidden Hiking Trails',
        img: 'https://picsum.photos/seed/hiking/36/36',
    },
];

const FbSideBarLeft = () => {
    return (
        <div className="sticky top-0 hidden h-full flex-col gap-1 overflow-y-auto rounded-xl border bg-white px-2 pt-4 pb-6 md:flex">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100"
                >
                    {item.icon}
                    <span className="text-[15px] font-medium text-gray-900">
                        {item.label}
                    </span>
                </button>
            ))}

            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                    <svg
                        className="h-5 w-5 text-gray-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                </div>
                <span className="text-[15px] font-medium text-gray-900">
                    See More
                </span>
            </button>

            <div className="my-2 border-t border-gray-300" />

            <p className="mb-1 px-2 text-[17px] font-semibold text-gray-700">
                Shortcuts
            </p>

            {SHORTCUT_ITEMS.map((item) => (
                <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100"
                >
                    <img
                        src={item.img}
                        alt={item.label}
                        className="h-9 w-9 rounded-lg object-cover"
                    />
                    <span className="text-[15px] font-medium text-gray-900">
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default FbSideBarLeft;
