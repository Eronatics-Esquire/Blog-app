export type Conversation = {
    id: number;
    users: Array<{
        id: number;
        name: string;
        profile_photo?: string;
        is_online?: boolean;
        last_seen_at?: string;
    }>;
    messages: Message[];
};

export type Message = {
    id: number;
    message: string;
    user_id: number;
    created_at: string;
    seen_at?: string | null;
    user?: {
        id: number;
        name: string;
    };
};

export type TypingUser = {
    userId: number;
    userName: string;
    timestamp: number;
};

export type Contact = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_photo?: string;
    is_online?: boolean;
    last_seen_at?: string;
};
