import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Context to share authentication state and actions across the application.
 */
const AuthContext = createContext();

/**
 * Provider component that wraps the application and manages the user's authentication session,
 * persistent token storage, login/registration actions, and updates to user fields.
 */
export const AuthProvider = ({ children }) => {
    // The current authenticated user object or null if not logged in
    const [user, setUser] = useState(null);
    // Loading state indicating if the initial session check or auth requests are in progress
    const [loading, setLoading] = useState(true);

    const API_URL = '/api/auth';

    /**
     * Checks user session validity using the stored JWT token.
     * Fetches user profile data from backend if token is valid.
     * 
     * @param {string} token - The JWT token to authorize the request
     */
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

    // On mount, check if there is an existing token stored in localStorage
    // and attempt to restore the user session.
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchMe(token);
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Authenticates the user with username and password.
     * Saves the returned JWT token to localStorage upon success.
     * 
     * @param {string} username - User's unique username
     * @param {string} password - User's password
     * @returns {Promise<Object>} The authenticated user object
     */
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

    /**
     * Registers a new user account with details (fullName, username, password, age, gender).
     * Automatically logs the user in and stores the JWT token upon successful registration.
     * 
     * @param {Object} formData - User details required for registration
     * @returns {Promise<Object>} The newly registered and authenticated user object
     */
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

            localStorage.setItem('token', data.token);
            setUser(data.user);
            return data.user;
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logs the current user out, clearing the authentication token from localStorage
     * and resetting the user state back to null.
     */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Updates specific fields of the current user profile state.
     * 
     * @param {Object} updatedFields - Fields to merge into the existing user object
     */
    const updateUser = (updatedFields) => {
        setUser(prev => prev ? { ...prev, ...updatedFields } : null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to easily consume the AuthContext state and functions.
 * Must be used within an AuthProvider component.
 */
export const useAuth = () => useContext(AuthContext);
