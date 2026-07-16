import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Heart, UserPlus, Sparkles, Check, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ onViewProfile }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const validNotifications = (data || []).filter(n => n && n.sender);
                setNotifications(validNotifications);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE':
                return <Heart size={14} color="#ff4757" fill="#ff4757" />;
            case 'FOLLOW':
                return <UserPlus size={14} color="var(--primary)" />;
            default:
                return <Sparkles size={14} color="var(--accent)" />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Notifications</h2>

            {notifications.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '64px 32px', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Inbox size={32} color="var(--primary)" style={{ opacity: 0.6 }} />
                    </div>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>All caught up</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                        When someone likes your dreams or follows you, you'll see it here!
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Unread Section */}
                    {unread.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '12px' }}>New</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <AnimatePresence>
                                    {unread.map((notification, idx) => (
                                        <NotificationRow
                                            key={notification.id}
                                            notification={notification}
                                            idx={idx}
                                            markAsRead={markAsRead}
                                            getIcon={getIcon}
                                            onViewProfile={onViewProfile}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Read Section */}
                    {read.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '12px' }}>Earlier</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <AnimatePresence>
                                    {read.map((notification, idx) => (
                                        <NotificationRow
                                            key={notification.id}
                                            notification={notification}
                                            idx={idx}
                                            markAsRead={markAsRead}
                                            getIcon={getIcon}
                                            onViewProfile={onViewProfile}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const NotificationRow = ({ notification, idx, markAsRead, getIcon, onViewProfile }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
        >
            <GlassCard
                onClick={() => !notification.read && markAsRead(notification.id)}
                style={{
                    padding: '14px 18px',
                    cursor: 'pointer',
                    background: notification.read ? 'var(--glass-bg)' : 'var(--primary-glow)',
                    border: notification.read ? 'var(--glass-border)' : '1px solid var(--primary)',
                    boxShadow: notification.read ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.08)',
                    borderRadius: 'var(--radius-xl)'
                }}
                className="hover-scale-subtle"
            >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img
                        src={notification.sender.avatarUrl}
                        alt={notification.sender.username}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid var(--primary)',
                            padding: '1px',
                            cursor: 'pointer'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile && onViewProfile(notification.sender);
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span 
                                style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewProfile && onViewProfile(notification.sender);
                                }}
                            >
                                {notification.sender.fullName || notification.sender.username}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {notification.message}
                            </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {getIcon(notification.type)}
                        </div>
                        {!notification.read && (
                            <Check size={14} style={{ color: 'var(--primary)' }} />
                        )}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default Notifications;
