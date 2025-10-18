export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    CHAT: '/chat',
};

export const COLORS = {
    PRIMARY: 'var(--primary)',
    PRIMARY_LIGHT: 'var(--primary-light)',
    SECONDARY: 'var(--secondary)',
    BACKGROUND: 'var(--background)',
    WHITE: 'var(--white)',
    TEXT_PRIMARY: 'var(--text-primary)',
    TEXT_SECONDARY: 'var(--text-secondary)',
    BORDER: 'var(--border)',
    ONLINE_GREEN: 'var(--online-green)',
    ERROR: 'var(--error)',
    MAIN_BG: 'var(--main-bg)',
    SENDER_BG: 'var(--sender-card-bg)',
    BUTTON_BG: 'var(--primary-btn)',

};

