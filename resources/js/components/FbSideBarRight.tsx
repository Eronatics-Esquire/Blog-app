import React from 'react';
import spotted from '../spotted.png';
const CONTACTS = [
  { name: 'Dennis Abalos', img: 'https://th.bing.com/th/id/OIP.RhAMDPDRswX1AtOHxP7DLwAAAA?w=147&h=108&c=7&qlt=90&bgcl=a358c2&r=0&o=6&pid=13.1', online: true },
  { name: 'Eric Tiglao', img: 'https://th.bing.com/th/id/OIP.gxuEj53wE-p-LiwqIoI2gwAAAA?w=147&h=108&c=7&qlt=90&bgcl=bae0ac&r=0&o=6&pid=13.1', online: false },
  { name: 'Cynthia Lopez', img: 'https://i.pravatar.cc/36?img=5', online: true },
  { name: 'Rodmark Buctuan', img: 'https://th.bing.com/th/id/OIP.4C1aL0h1llcHnK9AC9TdCQAAAA?w=99&h=108&c=7&qlt=90&bgcl=8a1594&r=0&o=6&pid=13.1', online: true },
  { name: 'Daryl Sumabal', img: 'https://th.bing.com/th/id/OIP.t5EkLwrNiNaoJ5ah0WswOAAAAA?w=108&h=108&c=1&bgcl=0b685d&r=0&o=7&pid=ImgRC&rm=3', online: false },
  { name: 'Changu Lopez', img: 'https://th.bing.com/th/id/OIP.7NaU0fj9xkJxyNMDuIqrZgHaHa?w=134&h=108&c=7&qlt=90&bgcl=8de963&r=0&o=6&pid=13.1', online: true },
]

const FbSideBarRight = () => {
    return (
        <div className="sticky top-0 hidden h-full flex-col gap-2 overflow-y-auto rounded-xl border bg-white px-2 pt-4 pb-6 lg:flex">
            <p className="mb-1 px-2 text-[17px] font-semibold text-gray-700">
                Sponsored
            </p>

            <div className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-100">
                <img
                    src={spotted}
                    alt="Spotted Pig"
                    className="h-[90px] w-[120px] flex-shrink-0 rounded-lg object-cover"
                />
                <div>
                    <p className="text-[13px] leading-tight font-semibold text-gray-900">
                        Spotted Pig
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-gray-500">
                        Experience the trendy coffee spot in Esquire Financing
                        being called the next big thing.
                    </p>
                </div>
            </div>

            <div className="my-2 border-t border-gray-300" />

            <p className="mb-1 px-2 text-[17px] font-semibold text-gray-700">
                Birthdays
            </p>
            <div className="flex items-center gap-3 px-2 py-1">
                <span className="text-2xl">🎂</span>
                <p className="text-[13px] text-gray-800">
                    <span className="font-semibold">Jessica, Erica</span> and{' '}
                    <span className="font-semibold">2 others</span> have
                    birthdays today
                </p>
            </div>

            <div className="my-2 border-t border-gray-300" />

            <div className="mb-1 flex items-center justify-between px-2">
                <p className="text-[17px] font-semibold text-gray-700">
                    Contacts
                </p>
                <div className="flex gap-1">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                        <svg
                            className="h-4 w-4 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                        <svg
                            className="h-4 w-4 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {CONTACTS.map((contact) => (
                <button
                    key={contact.name}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100"
                >
                    <div className="relative flex-shrink-0">
                        <img
                            src={contact.img}
                            alt={contact.name}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                        {contact.online && (
                            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                        )}
                    </div>
                    <span className="text-[15px] font-medium text-gray-900">
                        {contact.name}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default FbSideBarRight;