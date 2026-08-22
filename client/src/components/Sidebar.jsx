import React from 'react';
import { Home, MessageCircle, PlusSquare, Bell, LogOut, Search, Video, Users, Sun, Moon } from 'lucide-react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ activeTab, setActiveTab, setShowCreateModal, user, logout }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <GlassCard
            level="surface"
            className="sidebar"
            style={{
                width: '268px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '28px 20px',
                borderRadius: 'var(--radius-2xl)',
            }}
        >
            {/* Logo area */}
            <div
                style={{
                    marginBottom: '40px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    cursor: 'pointer',
                }}
                onClick={() => setActiveTab('feed')}
            >
                <img
                    src="/logo-mark.svg"
                    style={{ width: '30px', height: '30px', display: 'block' }}
                    alt="DreamMatch Logo"
                />
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                }}>DreamMatch</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                <NavItem icon={Home} label="Timeline" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                <NavItem icon={Search} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                <NavItem icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                <NavItem icon={PlusSquare} label="Record a Dream" onClick={() => setShowCreateModal(true)} type="action" />
                <NavItem icon={Video} label="Visuals" active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} />
                <NavItem icon={Users} label="Matches" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                <NavItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                <NavItem
                    icon={theme === 'dark' ? Sun : Moon}
                    label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    onClick={toggleTheme}
                />
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                    onClick={() => setActiveTab('profile')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: activeTab === 'profile' || activeTab === 'settings'
                            ? 'var(--glass-whisper-bg)'
                            : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                        border: activeTab === 'profile' || activeTab === 'settings'
                            ? 'var(--glass-whisper-border)'
                            : '1px solid transparent',
                    }}
                >
                    <img
                        src={user?.avatarUrl}
                        alt="avatar"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '1.5px solid var(--phosphor)',
                            padding: '2px',
                            objectFit: 'cover',
                        }}
                    />
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--text-primary)',
                        }}>{user?.fullName || 'Dreamer'}</div>
                        <div style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--fog)',
                        }}>@{user?.username || 'user'}</div>
                    </div>
                </div>

                <NavItem icon={LogOut} label="Sign Out" onClick={logout} />
            </div>
        </GlassCard>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick, type = 'nav' }) => {
    const isAction = type === 'action';

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '13px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: active || isAction ? 500 : 400,
                fontSize: 'var(--text-base)',
                color: active ? 'white' : isAction ? 'var(--phosphor)' : 'var(--text-secondary)',
                position: 'relative',
                transition: 'color var(--transition-fast)',
                marginBottom: isAction ? '10px' : '0',
                marginTop: isAction ? '10px' : '0',
                background: isAction ? 'var(--phosphor-subtle)' : 'transparent',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        >
            {active && !isAction && (
                <motion.div
                    layoutId="sidebarActiveBackground"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'var(--primary-gradient)',
                        borderRadius: 'var(--radius-md)',
                        zIndex: -1,
                        boxShadow: '0 4px 16px var(--phosphor-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
        </div>
    );
};

export default Sidebar;
