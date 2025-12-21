import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = '/api/auth';

    const fetchMe = async (token) => {
        try {
            const res = await fetch(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                setUser(data);
            } else {
                const text = await res.text();
                console.error('Session check failed (non-JSON):', text);
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (e) {
            console.error('Session check failed', e);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchMe(token);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Login failed');
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return data.user;
            } else {
                const errorText = await res.text();
                console.error('Login failed (non-JSON):', errorText);
                throw new Error('Server returned an invalid response. Please check if the backend is running.');
            }
        } catch (e) {
            console.error('Login error:', e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            return data;
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
