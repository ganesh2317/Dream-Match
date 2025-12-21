import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Heart, UserPlus, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
                return <Heart size={20} color="#ff6b6b" fill="#ff6b6b" />;
            case 'FOLLOW':
                return <UserPlus size={20} color="var(--primary)" />;
            default:
                return <Sparkles size={20} color="var(--accent)" />;
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
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 800 }}>Notifications</h2>

            {notifications.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Sparkles size={40} color="var(--primary)" opacity={0.6} />
                    </div>
                    <h3 style={{ marginBottom: '12px', fontSize: '22px' }}>No notifications yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                        When someone likes your dreams or follows you, you'll see it here!
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map((notification) => (
                        <GlassCard
                            key={notification.id}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                background: notification.read ? 'var(--glass-bg)' : 'rgba(99, 102, 241, 0.05)',
                                border: notification.read ? '1px solid var(--glass-border)' : '1px solid rgba(99, 102, 241, 0.2)',
                                transition: 'all 0.2s'
                            }}
                            className="hover-bg"
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img
                                    src={notification.sender.avatarUrl}
                                    alt={notification.sender.username}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '15px' }}>
                                            {notification.sender.fullName}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                            {notification.message}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {getIcon(notification.type)}
                                    {notification.read && (
                                        <Check size={16} color="var(--success)" />
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
