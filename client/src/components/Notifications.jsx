import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Heart, UserPlus, Sparkles, Check, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
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
                setNotifications(data);
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
                return <Heart size={16} color="#ff4757" fill="#ff4757" />;
            case 'FOLLOW':
                return <UserPlus size={16} color="var(--primary)" />;
            default:
                return <Sparkles size={16} color="var(--accent)" />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Notifications</h2>

            {notifications.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '64px 32px', border: 'var(--glass-border)' }}>
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
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>No notifications yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                        When someone likes your dreams or follows you, you'll see it here!
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                        {notifications.map((notification, idx) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                            >
                                <GlassCard
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    style={{
                                        padding: '16px 20px',
                                        cursor: 'pointer',
                                        background: notification.read ? 'var(--glass-bg)' : 'rgba(99, 102, 241, 0.04)',
                                        border: notification.read ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(99, 102, 241, 0.25)',
                                        boxShadow: notification.read ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.1)'
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
                                                border: '1.5px solid rgba(255,255,255,0.06)'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                                                    {notification.sender.fullName}
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
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
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}>
                                                {getIcon(notification.type)}
                                            </div>
                                            {notification.read && (
                                                <Check size={14} style={{ color: 'var(--success)' }} />
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Notifications;
