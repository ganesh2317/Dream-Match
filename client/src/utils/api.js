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
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'API request failed');
            }
            return data;
        } else {
            const text = await res.text();
            if (!res.ok) {
                throw new Error(res.status === 503 || res.status === 500 ? 'Service temporarily unavailable. Please try again shortly.' : `Server error (${res.status})`);
            }
            return text;
        }
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
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'API request failed');
            }
            return data;
        } else {
            await res.text(); // consume body to free connection
            throw new Error(res.status === 503 || res.status === 500 ? 'Service temporarily unavailable. Please try again shortly.' : `Server error (${res.status})`);
        }
    }
};
