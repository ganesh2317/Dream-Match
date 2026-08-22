import React from 'react';
import { Home, Video, Heart, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = ({ activeTab, setActiveTab, onAddClick }) => {
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
            height: '68px',
            background: 'var(--glass-float-bg, var(--glass-bg))',
            backdropFilter: 'var(--glass-float-blur, var(--glass-blur))',
            WebkitBackdropFilter: 'var(--glass-float-blur, var(--glass-blur))',
            border: 'var(--glass-float-border, var(--glass-border))',
            borderRadius: 'var(--radius-2xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            boxShadow: 'var(--shadow-high)',
            zIndex: 999,
        }}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.isSpecial) {
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={onAddClick}
                            aria-label="Record a Dream"
                            style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                background: 'var(--primary-gradient)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px var(--phosphor-glow)',
                                position: 'relative',
                                top: '-4px',
                            }}
                        >
                            <Icon size={22} strokeWidth={2.5} />
                        </motion.button>
                    );
                }

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            position: 'relative',
                            color: isActive ? 'var(--phosphor)' : 'var(--fog)',
                            cursor: 'pointer',
                            transition: 'color var(--transition-fast)',
                            boxShadow: 'none',
                            transform: 'none',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomBubble"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--phosphor-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    zIndex: -1,
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        <motion.div
                            animate={{ scale: isActive ? 1.1 : 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </motion.div>
                        <span style={{
                            fontSize: '9px',
                            fontWeight: isActive ? 600 : 400,
                            letterSpacing: '0.1px',
                            color: isActive ? 'var(--text-primary)' : 'var(--fog)',
                        }}>
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="bottomDot"
                                style={{
                                    position: 'absolute',
                                    bottom: '1px',
                                    width: '3px',
                                    height: '3px',
                                    borderRadius: '50%',
                                    background: 'var(--phosphor)',
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
