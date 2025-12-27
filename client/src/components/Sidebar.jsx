import React from 'react';
import { Home, MessageCircle, PlusSquare, Bell, Settings, User as UserIcon, LogOut, Search, Video, Users } from 'lucide-react';
import GlassCard from './GlassCard';

const Sidebar = ({ activeTab, setActiveTab, setShowCreateModal, user, logout }) => {
    return (
        <GlassCard className="sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
            <h1 style={{
                fontSize: '22px',
                marginBottom: '42px',
                color: 'var(--text-primary)',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}>
                    <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                </div>
                DreamMatch
            </h1>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <NavItem icon={Home} label="Timeline" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                <NavItem icon={Search} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                <NavItem icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                <NavItem icon={PlusSquare} label="Share Dream" onClick={() => setShowCreateModal(true)} type="action" />
                <NavItem icon={Video} label="Visuals" active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} />
                <NavItem icon={Users} label="Matches" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                <NavItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                    onClick={() => setActiveTab('profile')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: activeTab === 'profile' ? 'var(--glass-hover)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        border: activeTab === 'profile' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                        transform: 'scale(1) translateY(0)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)';
                        e.currentTarget.style.background = 'var(--glass-hover)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <img src={user?.avatarUrl} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)', padding: '2px' }} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName || 'User'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user?.username || 'user'}</div>
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
                gap: '14px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: active ? 'var(--primary-gradient)' : isAction ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                fontWeight: active || isAction ? 600 : 500,
                color: active ? 'white' : isAction ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: active ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none',
                marginBottom: isAction ? '12px' : '0',
                marginTop: isAction ? '12px' : '0',
                transform: 'scale(1) translateY(0)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)';
                if (!active) e.currentTarget.style.background = isAction ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass-hover)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                if (!active) e.currentTarget.style.background = isAction ? 'rgba(99, 102, 241, 0.1)' : 'transparent';
            }}
        >
            <Icon size={20} />
            <span style={{ fontSize: '15px' }}>{label}</span>
        </div>
    );
};

export default Sidebar;
