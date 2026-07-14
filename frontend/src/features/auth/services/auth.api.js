// ── Auth API ──────────────────────────────────────────────────────────────────
// All functions throw on error so calling hooks can show proper error messages.

import api from '../../../lib/api';

/* Register — creates a new account */
export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', { username, email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
}

/* Login — returns { user } on success, throws on failure */
export async function login({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
}

/* Logout — clears the session cookie */
export async function logout() {
    const response = await api.get('/api/auth/logout');
    localStorage.removeItem('token');
    return response.data;
}

/* Get current user — throws if not authenticated (used by AuthContext) */
export async function getMe() {
    const response = await api.get('/api/auth/get-me');
    return response.data;
}