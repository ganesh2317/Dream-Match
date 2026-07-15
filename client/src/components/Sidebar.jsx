import React from 'react';
import { Home, MessageCircle, PlusSquare, Bell, User as UserIcon, LogOut, Search, Video, Users } from 'lucide-react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, setShowCreateModal, user, logout }) => {
    return (
        <GlassCard className="sidebar" style={{ 
            width: '280px', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            padding: '24px', 
            background: 'var(--glass-bg)', 
            border: 'var(--glass-border)',
            borderRadius: 'var(--radius-2xl)'
        }}>
            <div style={{
                fontSize: '22px',
                marginBottom: '42px',
                color: 'var(--text-primary)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
            }} onClick={() => setActiveTab('feed')}>
                <img src="/logo-mark.svg" style={{ width: '32px', height: '32px', display: 'block' }} alt="DreamMatch Logo" />
                <span>DreamMatch</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                <NavItem icon={Home} label="Timeline" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                <NavItem icon={Search} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                <NavItem icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                <NavItem icon={PlusSquare} label="Share Dream" onClick={() => setShowCreateModal(true)} type="action" />
                <NavItem icon={Video} label="Visuals" active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} />
                <NavItem icon={Users} label="Matches" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                <NavItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('profile')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: activeTab === 'profile' || activeTab === 'settings' ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                        border: activeTab === 'profile' || activeTab === 'settings' ? '1px solid var(--primary)' : '1px solid transparent'
                    }}
                >
                    <img src={user?.avatarUrl} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)', padding: '2px', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{user?.fullName || 'User'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user?.username || 'user'}</div>
                    </div>
                </motion.div>

                <NavItem icon={LogOut} label="Sign Out" onClick={logout} />
            </div>
        </GlassCard>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick, type = 'nav' }) => {
    const isAction = type === 'action';

    return (
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: active || isAction ? 600 : 500,
                color: active ? 'white' : isAction ? 'var(--primary)' : 'var(--text-secondary)',
                position: 'relative',
                transition: 'color var(--transition-fast)',
                marginBottom: isAction ? '12px' : '0',
                marginTop: isAction ? '12px' : '0',
                background: isAction ? 'rgba(139, 92, 246, 0.08)' : 'transparent'
            }}
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
                        boxShadow: '0 8px 20px var(--primary-glow)'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
            
            <Icon size={20} />
            <span style={{ fontSize: '14px', letterSpacing: '0.1px' }}>{label}</span>
        </motion.div>
    );
};

export default Sidebar;
