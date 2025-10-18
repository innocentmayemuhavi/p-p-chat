import axios from 'axios';
import { API_URL } from '../shared/constants';

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface SignupData {
    email: string;
    mobile: string;
    name: string;
    password: string;
}

export interface LoginData {
    emailOrMobile: string;
    password: string;
}

export const authAPI = {
    signup: async (data: SignupData) => {
        const response = await api.post('/api/auth/signup', data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await api.post('/api/auth/login', data);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
};

export const userAPI = {
    searchUsers: async (query: string) => {
        const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    getUserById: async (userId: string) => {
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
    },
};

export default api;
