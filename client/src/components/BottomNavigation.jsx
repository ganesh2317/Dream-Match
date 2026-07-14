import React from 'react';
import { Home, Search, MessageCircle, Video, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
    // Navigation items representing the main user-experience hubs of the platform.
    // Each matches an activeTab state key in Dashboard.jsx.
    const navItems = [
        { id: 'feed', icon: Home, label: 'Feed' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'messages', icon: MessageCircle, label: 'Messages' },
        { id: 'visuals', icon: Video, label: 'Visuals' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            height: '64px',
            background: 'rgba(10, 10, 15, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 999
        }} className="mobile-only-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            position: 'relative',
                            color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                            cursor: 'pointer',
                            transition: 'color var(--transition-fast)',
                            boxShadow: 'none',
                            transform: 'none'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomBubble"
                                className="absolute-bg"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    borderRadius: '16px',
                                    zIndex: -1
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        
                        <motion.div
                            animate={{ scale: isActive ? 1.1 : 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Icon size={20} />
                        </motion.div>
                        
                        <span style={{ 
                            fontSize: '10px', 
                            fontWeight: isActive ? 700 : 500,
                            letterSpacing: '0.2px'
                        }}>
                            {item.label}
                        </span>

                        {isActive && (
                            <motion.div
                                layoutId="bottomDot"
                                style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)'
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNavigation;
