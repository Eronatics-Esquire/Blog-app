import React from 'react';

const NAV_ITEMS = [
    {
        label: 'Aaron Castañeda',
        icon: (
            <img
                src="data:image/webp;base64,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"
                className="h-9 w-9 rounded-full object-cover"
            />
        ),
    },
    {
        label: 'Watch',
        icon: (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                <svg
                    className="h-5 w-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8l-5 3V8l5 3zm5 3l-5-3 5-3v6z" />
                </svg>
            </div>
        ),
    },
    {
        label: 'Events',
        icon: (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                <svg
                    className="h-5 w-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                </svg>
            </div>
        ),
    },
    {
        label: 'Friends',
        icon: (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                <svg
                    className="h-5 w-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
            </div>
        ),
    },
    {
        label: 'Memories',
        icon: (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                <svg
                    className="h-5 w-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
            </div>
        ),
    },
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
        <div className="sticky top hidden h-screen flex-col gap-1 overflow-y-auto bg-white px-2 pt-4 pb-6 md:flex">

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
        </div>
    );
};

export default FbSideBarLeft;
