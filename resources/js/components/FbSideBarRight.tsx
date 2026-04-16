import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/auth';

const FbSideBarRight = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch('/api/contacts/presence', {
                    headers: { Accept: 'application/json' },
                });
                const data = await response.json();
                console.log('Contacts fetched:', data);
                setContacts(data.contacts || []);
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
        const interval = setInterval(fetchContacts, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sticky top-0 hidden h-full flex-col gap-2 overflow-y-auto rounded-xl border bg-white px-2 pt-4 pb-6 lg:flex">
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

            {loading ? (
                <div className="space-y-3 px-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="px-2">
                    <p className="text-sm text-gray-500">No contacts found</p>
                    <p className="mt-2 text-xs text-red-500">
                        Debug: contacts = {JSON.stringify(contacts)}
                    </p>
                </div>
            ) : (
                contacts.map((contact) => {
                    const imageUrl = contact.profile_photo
                        ? `/storage/${contact.profile_photo}?v=${Date.now()}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`;

                    return (
                        <div
                            key={contact.id}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100"
                        >
                            <div className="relative h-8 w-8">
                                <img
                                    src={imageUrl}
                                    alt={contact.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`;
                                    }}
                                />
                                <span
                                    className={cn(
                                        'absolute right-0 bottom-0 rounded-full border-2 border-white',
                                        contact.is_online
                                            ? 'bg-green-500'
                                            : 'bg-gray-400',
                                        'h-2 w-2',
                                    )}
                                    style={{ zIndex: 10 }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-medium text-gray-900">
                                    {contact.name}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs',
                                        contact.is_online
                                            ? 'text-green-600'
                                            : 'text-gray-500',
                                    )}
                                >
                                    {contact.is_online
                                        ? 'Active now'
                                        : 'Offline'}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default FbSideBarRight;
