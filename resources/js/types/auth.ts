export type User = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    presence?: {
        is_online: boolean;
        last_seen_at: string | null;
    };
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Contact = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_photo: string | null;
    is_online: boolean;
    last_seen_at: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
