import { Conversation } from './types';

export const getCsrfToken = (): string => {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || ''
    );
};

export const getOtherUser = (convo: Conversation, authUserId?: number) => {
    return convo.users?.find((u) => u.id !== authUserId);
};

export const getContactName = (contact: {
    name: string;
    first_name?: string | null;
    last_name?: string | null;
}): string => {
    return (
        [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
        contact.name
    );
};

export const POLLING_INTERVAL = 30000;
export const TYPING_TIMEOUT = 1000;
