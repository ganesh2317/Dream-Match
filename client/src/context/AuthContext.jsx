import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for active session
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            // Verify credentials
            const foundUser = users.find(u => u.username === username && u.password === password);

            if (foundUser) {
                const userSession = { ...foundUser };
                delete userSession.password; // Don't store password in session
                localStorage.setItem('currentUser', JSON.stringify(userSession));
                setUser(userSession);
                setLoading(false);
                return userSession;
            } else {
                setLoading(false);
                if (username === 'demo' && password === 'password123') {
                    // Emergency demo user
                    const demoUser = { id: 'demo', username: 'demo', fullName: 'Demo User', avatarUrl: 'https://ui-avatars.com/api/?name=Demo&background=random', streakCount: 0 };

                    localStorage.setItem('currentUser', JSON.stringify(demoUser));
                    setUser(demoUser);
                    return demoUser;
                }
                throw new Error('Invalid username or password');
            }
        } catch (e) {
            setLoading(false);
            throw e;
        }
    };

    const register = async (formData) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // Check uniqueness
            if (users.find(u => u.username === formData.username)) {
                throw new Error('Username already taken');
            }

            const newUser = {
                id: Date.now().toString(),
                ...formData,
                message: 'Registered successfully',
                streakCount: 0,
                avatarUrl: `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            setLoading(false);
            return newUser;
        } catch (e) {
            setLoading(false);
            throw e;
        }
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
