import React from 'react';
import { Home, Video, Heart, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = ({ activeTab, setActiveTab, onAddClick }) => {
    // Navigation items representing the main user-experience hubs of the platform.
    // Styled exactly to replicate screens 4, 5, 6, 7, 8, 9, 10
    const navItems = [
        { id: 'feed', icon: Home, label: 'Home' },
        { id: 'visuals', icon: Video, label: 'Visuals' },
        { id: 'add', icon: Plus, label: 'Create', isSpecial: true },
        { id: 'matches', icon: Heart, label: 'Match' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '480px',
            height: '70px',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--radius-2xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 10px',
            boxShadow: 'var(--glass-shadow)',
            zIndex: 999
        }}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.isSpecial) {
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={onAddClick}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--primary-gradient)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 6px 16px var(--primary-glow)',
                                position: 'relative',
                                top: '-4px'
                            }}
                        >
                            <Icon size={24} strokeWidth={2.5} />
                        </motion.button>
                    );
                }

                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            // If user goes to profile or matches, clear settings subview
                            setActiveTab(item.id);
                        }}
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
                                    background: 'var(--primary-glow)',
                                    borderRadius: 'var(--radius-md)',
                                    zIndex: -1
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        
                        <motion.div
                            animate={{ scale: isActive ? 1.08 : 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </motion.div>
                        
                        <span style={{ 
                            fontSize: '9px', 
                            fontWeight: isActive ? 700 : 500,
                            letterSpacing: '0.2px',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-dim)'
                        }}>
                            {item.label}
                        </span>

                        {isActive && (
                            <motion.div
                                layoutId="bottomDot"
                                style={{
                                    position: 'absolute',
                                    bottom: '1px',
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
