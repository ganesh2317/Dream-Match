import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import Input from './Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
    User, 
    Lock, 
    Shield, 
    Users, 
    Moon, 
    Sun,
    Bell, 
    Globe, 
    Sliders, 
    HelpCircle, 
    Mail, 
    Info, 
    LogOut,
    ArrowLeft,
    ChevronRight,
    X,
    Check,
    AlertCircle,
    UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ title, onClose, children }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--modal-overlay)', backdropFilter: 'blur(16px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
    }} onClick={onClose}>
        <motion.div 
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            style={{ width: '100%', maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}
        >
            <GlassCard level="overlay" style={{ padding: '28px 24px', borderRadius: 'var(--radius-2xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'var(--glass-whisper-bg)', border: 'none', color: 'var(--fog)', 
                            borderRadius: '50%', width: '30px', height: '30px', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                        }}
                    >
                        <X size={15} />
                    </button>
                </div>
                {children}
            </GlassCard>
        </motion.div>
    </div>
);

const Settings = ({ onBack, onNavigateProfile }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, updateUser } = useAuth();

    const [activeModal, setActiveModal] = useState(null); // 'password', 'privacy', 'blocked', 'language', 'content', 'help', 'contact', 'about'

    // Form states
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    // Blocked users state
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loadingBlocked, setLoadingBlocked] = useState(false);

    // Push notification preference state
    const [pushEnabled, setPushEnabled] = useState(user?.pushNotificationsEnabled ?? true);
    const [pushFeedback, setPushFeedback] = useState('');

    // Language & content preference state
    const [language, setLanguage] = useState(user?.language || 'English');
    const [contentPref, setContentPref] = useState(user?.contentPreference || 'all');


    useEffect(() => {
        if (user) {
            setPushEnabled(user.pushNotificationsEnabled ?? true);
            setLanguage(user.language || 'English');
            setContentPref(user.contentPreference || 'all');
        }
    }, [user]);

    const handleLogoutClick = () => {
        localStorage.removeItem('activeTab');
        localStorage.removeItem('selectedChatUser');
        logout();
    };

    const handlePushToggle = async (e) => {
        const newValue = e.target.checked;
        setPushEnabled(newValue);
        setPushFeedback('Saving preference...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ pushNotificationsEnabled: newValue })
            });
            if (res.ok) {
                updateUser({ pushNotificationsEnabled: newValue });
                setPushFeedback('Preference saved');
                setTimeout(() => setPushFeedback(''), 3000);
            }
        } catch (error) {
            console.error('Error toggling push notifications:', error);
            setPushFeedback('Failed to save preference');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        if (!passwords.currentPassword || !passwords.newPassword) {
            setPassError('All password fields are required.');
            return;
        }

        if (passwords.newPassword.length < 8) {
            setPassError('New password must be at least 8 characters long.');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPassError('New password and confirmation do not match.');
            return;
        }

        setPassLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                setPassSuccess('Password changed successfully! Previous sessions invalidated.');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    setActiveModal(null);
                    setPassSuccess('');
                }, 2000);
            } else {
                setPassError(data.message || 'Failed to change password.');
            }
        } catch (err) {
            setPassError(err.message || 'Error changing password.');
        } finally {
            setPassLoading(false);
        }
    };

    const fetchBlockedUsers = async () => {
        setLoadingBlocked(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users/blocked', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBlockedUsers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBlocked(false);
        }
    };

    const handleUnblock = async (blockedId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/unblock/${blockedId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openBlockedModal = () => {
        setActiveModal('blocked');
        fetchBlockedUsers();
    };

    const savePreferenceSetting = async (key, value) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [key]: value })
            });
            if (res.ok) {
                updateUser({ [key]: value });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActiveModal(null);
        }
    };


    const sections = [
        {
            title: 'Account',
            items: [
                { id: 'profile', label: 'Edit Profile', icon: User, action: onNavigateProfile },
                { id: 'password', label: 'Change Password', icon: Lock, action: () => setActiveModal('password') },
                { id: 'privacy', label: 'Privacy Policy', icon: Shield, action: () => setActiveModal('privacy') },
                { id: 'blocked', label: 'Blocked Users', icon: Users, action: openBlockedModal }
            ]
        },
        {
            title: 'Preferences',
            items: [
                { id: 'theme', label: theme === 'dark' ? 'Dark Mode' : 'Light Mode', icon: theme === 'dark' ? Moon : Sun, type: 'toggle', value: theme === 'dark', onChange: toggleTheme },
                { id: 'notifications', label: 'Push Notifications', icon: Bell, type: 'push-toggle', value: pushEnabled, onChange: handlePushToggle },
                { id: 'language', label: 'Language', icon: Globe, type: 'value', valueText: language, action: () => setActiveModal('language') },
                { id: 'content', label: 'Content Preferences', icon: Sliders, type: 'value', valueText: contentPref === 'all' ? 'All Content' : contentPref, action: () => setActiveModal('content') }
            ]
        },
        {
            title: 'Support',
            items: [
                { id: 'help', label: 'Help Center', icon: HelpCircle, action: () => setActiveModal('help') },
                { id: 'contact', label: 'Contact Us', icon: Mail, action: () => setActiveModal('contact') },
                { id: 'about', label: 'About Dream Match', icon: Info, action: () => setActiveModal('about') }
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
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
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
                            fontSize: '12px', 
                            color: 'var(--fog)', 
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
                                const isToggle = item.type === 'toggle' || item.type === 'push-toggle';
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
                                            cursor: isToggle ? 'default' : 'pointer'
                                        }}
                                        className={isToggle ? '' : 'hover-bg-simple'}
                                        onClick={isToggle ? undefined : item.action}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '10px', 
                                                background: 'var(--phosphor-subtle)', 
                                                color: 'var(--phosphor)',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}>
                                                <Icon size={18} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: 600, 
                                                    color: 'var(--text-primary)',
                                                    fontFamily: 'var(--font-body)'
                                                }}>
                                                    {item.label}
                                                </span>
                                                {item.type === 'push-toggle' && pushFeedback && (
                                                    <span style={{ fontSize: '11px', color: 'var(--phosphor)', fontWeight: 500 }}>
                                                        {pushFeedback}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isToggle ? (
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
                                                    background: item.value ? 'var(--phosphor)' : 'rgba(255,255,255,0.1)',
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
                                                <span style={{ fontSize: '14px', color: 'var(--fog)', fontWeight: 500 }}>
                                                    {item.valueText}
                                                </span>
                                                <ChevronRight size={16} color="var(--fog)" />
                                            </div>
                                        ) : (
                                            <ChevronRight size={16} color="var(--fog)" />
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
                            color: '#ef4444',
                            fontFamily: 'var(--font-body)'
                        }}>
                            Log Out
                        </span>
                    </div>
                    <ChevronRight size={16} color="#ef4444" style={{ opacity: 0.6 }} />
                </GlassCard>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'password' && (
                    <SettingsModal title="Change Password" onClose={() => setActiveModal(null)}>
                        {passError && (
                            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={15} /> {passError}
                            </div>
                        )}
                        {passSuccess && (
                            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#10b981', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={15} /> {passSuccess}
                            </div>
                        )}
                        <form onSubmit={handlePasswordSubmit}>
                            <Input
                                label="Current Password"
                                type="password"
                                placeholder="Enter current password"
                                value={passwords.currentPassword}
                                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="Enter new password (min 8 chars)"
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="Confirm new password"
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                disabled={passLoading}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--primary-gradient)', color: 'white', fontWeight: 600,
                                    fontSize: '15px', border: 'none', cursor: 'pointer', marginTop: '12px',
                                    opacity: passLoading ? 0.7 : 1
                                }}
                            >
                                {passLoading ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </form>
                    </SettingsModal>
                )}

                {activeModal === 'privacy' && (
                    <SettingsModal title="Privacy Policy" onClose={() => setActiveModal(null)}>
                        <div style={{ maxHeight: '320px', overflowY: 'auto', color: 'var(--fog)', fontSize: '13px', lineHeight: 1.6, paddingRight: '6px' }}>
                            <p style={{ marginBottom: '12px' }}><strong>Dream Match Privacy & Data Protection</strong></p>
                            <p style={{ marginBottom: '10px' }}>Your dream logs and personal data are protected under strict encryption standards. We value the intimate nature of subconscious recording.</p>
                            <p style={{ marginBottom: '10px' }}><strong>1. Data Collection:</strong> We collect dream prompts, generated images, and user preferences to compute dream compatibility scores.</p>
                            <p style={{ marginBottom: '10px' }}><strong>2. Data Usage:</strong> Your public dreams are visible to fellow wanderers. Private settings allow filtering dream visibility.</p>
                            <p style={{ marginBottom: '10px' }}><strong>3. Account Security:</strong> Password hashes are salted with bcrypt. Password changes automatically invalidate active session tokens.</p>
                        </div>
                    </SettingsModal>
                )}

                {activeModal === 'blocked' && (
                    <SettingsModal title="Blocked Users" onClose={() => setActiveModal(null)}>
                        {loadingBlocked ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fog)' }}>Loading blocked users...</div>
                        ) : blockedUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--fog)' }}>
                                <UserX size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                                <p style={{ fontSize: '14px' }}>No blocked users.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                {blockedUsers.map(u => (
                                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--glass-whisper-bg)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={u.avatarUrl} alt={u.username} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{u.fullName}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--fog)' }}>@{u.username}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleUnblock(u.id)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}>
                                            Unblock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SettingsModal>
                )}

                {activeModal === 'language' && (
                    <SettingsModal title="Language Preferences" onClose={() => setActiveModal(null)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['English', 'Spanish', 'French', 'German', 'Japanese'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => { setLanguage(lang); savePreferenceSetting('language', lang); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', background: language === lang ? 'var(--phosphor-subtle)' : 'transparent',
                                        border: '1px solid ' + (language === lang ? 'var(--phosphor)' : 'transparent'),
                                        borderRadius: '12px', color: 'var(--text-primary)', cursor: 'pointer',
                                        fontWeight: language === lang ? 600 : 400
                                    }}
                                >
                                    <span>{lang}</span>
                                    {language === lang && <Check size={16} color="var(--phosphor)" />}
                                </button>
                            ))}
                        </div>
                    </SettingsModal>
                )}

                {activeModal === 'content' && (
                    <SettingsModal title="Content Preferences" onClose={() => setActiveModal(null)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { id: 'all', label: 'All Dreams & Visuals', desc: 'Show all community dreamscapes' },
                                { id: 'ethereal', label: 'Ethereal Only', desc: 'Show light and peaceful dreams' },
                                { id: 'cosmic', label: 'Cosmic & Surreal', desc: 'Filter for sci-fi and space dream themes' }
                            ].map(pref => (
                                <button
                                    key={pref.id}
                                    onClick={() => { setContentPref(pref.id); savePreferenceSetting('contentPreference', pref.id); }}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '12px 16px', background: contentPref === pref.id ? 'var(--phosphor-subtle)' : 'transparent',
                                        border: '1px solid ' + (contentPref === pref.id ? 'var(--phosphor)' : 'transparent'),
                                        borderRadius: '12px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{pref.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--fog)', marginTop: '2px' }}>{pref.desc}</div>
                                </button>
                            ))}
                        </div>
                    </SettingsModal>
                )}

                {activeModal === 'help' && (
                    <SettingsModal title="Help Center" onClose={() => setActiveModal(null)}>
                        <div style={{ color: 'var(--fog)', fontSize: '13px', lineHeight: 1.6 }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Frequently Asked Questions</p>
                            <p><strong>Q: How do AI Visuals work?</strong><br />A: When you record a dream, our AI engine creates artwork matching your prompt and compiles a video reel.</p>
                            <br />
                            <p><strong>Q: How are Dream Twins matched?</strong><br />A: Matches are computed using dream sentiment and keyword correlation.</p>
                        </div>
                    </SettingsModal>
                )}

                {activeModal === 'contact' && (
                    <SettingsModal title="Contact Us" onClose={() => setActiveModal(null)}>
                        <div style={{ color: 'var(--fog)', fontSize: '13px', lineHeight: 1.6, textAlign: 'center', padding: '10px 0' }}>
                            <Mail size={32} color="var(--phosphor)" style={{ marginBottom: '12px' }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>Dream Match Support</p>
                            <p style={{ marginTop: '6px' }}>Have feedback or need assistance with your dreamscape account?</p>
                            <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--phosphor)' }}>support@dreammatch.app</p>
                        </div>
                    </SettingsModal>
                )}

                {activeModal === 'about' && (
                    <SettingsModal title="About Dream Match" onClose={() => setActiveModal(null)}>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌙</div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>DreamMatch v1.2</h4>
                            <p style={{ color: 'var(--fog)', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
                                Where dreams find each other in the dark.<br />
                                Built with bioluminescent liquid-glass design system.
                            </p>
                        </div>
                    </SettingsModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
