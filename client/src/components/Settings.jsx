import React from 'react';
import GlassCard from './GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
    User, 
    Lock, 
    Shield, 
    Users, 
    Moon, 
    Bell, 
    Globe, 
    Sliders, 
    HelpCircle, 
    Mail, 
    Info, 
    LogOut,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';

const Settings = ({ onBack }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();

    const handleLogoutClick = () => {
        localStorage.removeItem('activeTab');
        localStorage.removeItem('selectedChatUser');
        logout();
    };

    const sections = [
        {
            title: 'Account',
            items: [
                { id: 'profile', label: 'Edit Profile', icon: User },
                { id: 'password', label: 'Change Password', icon: Lock },
                { id: 'privacy', label: 'Privacy Policy', icon: Shield },
                { id: 'blocked', label: 'Blocked Users', icon: Users }
            ]
        },
        {
            title: 'Preferences',
            items: [
                { id: 'theme', label: 'Dark Mode', icon: Moon, type: 'toggle', value: theme === 'dark', onChange: toggleTheme },
                { id: 'notifications', label: 'Push Notifications', icon: Bell, type: 'toggle', value: true, onChange: () => {} },
                { id: 'language', label: 'Language', icon: Globe, type: 'value', valueText: 'English' },
                { id: 'content', label: 'Content Preferences', icon: Sliders }
            ]
        },
        {
            title: 'Support',
            items: [
                { id: 'help', label: 'Help Center', icon: HelpCircle },
                { id: 'contact', label: 'Contact Us', icon: Mail },
                { id: 'about', label: 'About Dream Match', icon: Info }
            ]
        }
    ];

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: 'var(--glass-border)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transform: 'none'
                    }}
                >
                    <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Settings</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sections.map((section, idx) => (
                    <GlassCard 
                        key={idx} 
                        style={{ 
                            padding: '20px', 
                            background: 'var(--glass-bg)', 
                            border: 'var(--glass-border)',
                            borderRadius: 'var(--radius-xl)'
                        }}
                    >
                        <h3 style={{ 
                            fontSize: '13px', 
                            color: 'var(--text-muted)', 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px',
                            fontWeight: 700,
                            marginBottom: '16px' 
                        }}>
                            {section.title}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {section.items.map((item, itemIdx) => {
                                const Icon = item.icon;
                                return (
                                    <div 
                                        key={itemIdx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 8px',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'background var(--transition-fast)',
                                            cursor: item.type === 'toggle' ? 'default' : 'pointer'
                                        }}
                                        className={item.type === 'toggle' ? '' : 'hover-bg-simple'}
                                        onClick={item.type === 'toggle' ? undefined : () => alert(`${item.label} action triggers`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '10px', 
                                                background: 'rgba(139, 92, 246, 0.1)', 
                                                color: 'var(--primary)',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}>
                                                <Icon size={18} />
                                            </div>
                                            <span style={{ 
                                                fontSize: '15px', 
                                                fontWeight: 600, 
                                                color: 'var(--text-primary)' 
                                            }}>
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Right Accessories */}
                                        {item.type === 'toggle' ? (
                                            <label style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                width: '46px',
                                                height: '24px',
                                                cursor: 'pointer'
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.value} 
                                                    onChange={item.onChange}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    cursor: 'pointer',
                                                    inset: 0,
                                                    background: item.value ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                    borderRadius: '34px',
                                                    transition: '0.3s'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute',
                                                        content: '""',
                                                        height: '18px',
                                                        width: '18px',
                                                        left: item.value ? '24px' : '3px',
                                                        bottom: '3px',
                                                        background: 'white',
                                                        borderRadius: '50%',
                                                        transition: '0.3s',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }} />
                                                </span>
                                            </label>
                                        ) : item.type === 'value' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                    {item.valueText}
                                                </span>
                                                <ChevronRight size={16} color="var(--text-dim)" />
                                            </div>
                                        ) : (
                                            <ChevronRight size={16} color="var(--text-dim)" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                ))}

                {/* Log Out Box */}
                <GlassCard 
                    style={{ 
                        padding: '16px 20px', 
                        background: 'rgba(220, 38, 38, 0.05)', 
                        border: '1px solid rgba(220, 38, 38, 0.15)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                    onClick={handleLogoutClick}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            background: 'rgba(220, 38, 38, 0.15)', 
                            color: '#ef4444',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <LogOut size={18} />
                        </div>
                        <span style={{ 
                            fontSize: '15px', 
                            fontWeight: 700, 
                            color: '#ef4444' 
                        }}>
                            Log Out
                        </span>
                    </div>
                    <ChevronRight size={16} color="#ef4444" style={{ opacity: 0.6 }} />
                </GlassCard>
            </div>
        </div>
    );
};

export default Settings;
