// ── Shared Axios Instance ─────────────────────────────────────────────────────
// All feature API files import THIS instead of creating their own axios instance.
// This means one place to change the base URL or headers.

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,        // sends the auth cookie automatically
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
