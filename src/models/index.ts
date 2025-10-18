import type { Dispatch, SetStateAction } from "react";

export interface UserFace {
    id: string;
    name: string;
    email: string;
    mobile: string;
    isOnline: boolean;
    avatarUrl: string;
    lastActive?: Date;
    createdAt?: string;
}

export interface Message {
    id: string;
    from: string;
    to: string;
    message: string;
    timestamp: string;
    type: 'text' | 'system';
    read?: boolean;
}

export interface Chat {
    id: string;
    participant: UserFace;
    messages: Message[];
    lastMessage?: string;
    updatedAt: Date;
    unreadCount: number;
}

export interface ContextFace {
    user: UserFace | null;
    setUser: Dispatch<SetStateAction<UserFace | null>>;
    activeChat: string | null;
    setActiveChat: Dispatch<SetStateAction<string | null>>;
    chats: Map<string, Chat>;
    setChats: Dispatch<SetStateAction<Map<string, Chat>>>;
}

// Re-export for backward compatibility
export type userFace = UserFace;
export type chatsFace = Chat;

