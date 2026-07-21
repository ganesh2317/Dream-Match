const API_URL = import.meta.env.PROD
    ? 'https://dream-match.onrender.com/api'
    : '/api';

export const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    const host = import.meta.env.PROD
        ? 'https://dream-match.onrender.com'
        : '';
    return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const api = {
    async get(endpoint) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return res.json();
    },

    async post(endpoint, body) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Something went wrong');
        }
        return res.json();
    }
};
