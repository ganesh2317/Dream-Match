import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context to manage theme state (dark/light mode) across the application.
 */
const ThemeContext = createContext();

/**
 * Provider component that manages the application theme preference,
 * persisting choice in localStorage and applying attributes to document root.
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to wrap
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    /**
     * Toggles between 'dark' and 'light' theme modes.
     */
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to consume ThemeContext values and actions.
 */
export const useTheme = () => useContext(ThemeContext);
