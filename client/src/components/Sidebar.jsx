import React from 'react';
import { Home, MessageCircle, PlusSquare, Bell, Settings, User as UserIcon } from 'lucide-react';
import GlassCard from './GlassCard';

const Sidebar = ({ activeTab, setActiveTab, setShowCreateModal, user, logout }) => {
    return (
        <GlassCard className="sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
            <h1 style={{
                fontSize: '24px',
                marginBottom: '40px',
                color: 'var(--primary)',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>
                DREAM MATCH
            </h1>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavItem icon={Home} label="Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                <NavItem icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                <NavItem icon={PlusSquare} label="Post Dream" onClick={() => setShowCreateModal(true)} />
                <NavItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                <NavItem icon={Settings} label="Logout" onClick={logout} />
            </nav>

            {/* Profile Card - Clickable */}
            <div
                onClick={() => setActiveTab('profile')}
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: '0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
                <img src={user?.avatarUrl} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName || 'User'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{user?.username || 'user'}</div>
                </div>
            </div>
        </GlassCard>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        background: active ? 'var(--primary)' : 'transparent',
        fontWeight: active ? 600 : 400,
        color: active ? 'white' : 'var(--text-secondary)',
        transition: 'all 0.2s',
        boxShadow: active ? '0 4px 12px rgba(157, 80, 187, 0.3)' : 'none'
    }}
        onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    >
        <Icon size={20} />
        {label}
    </div>
);

export default Sidebar;
