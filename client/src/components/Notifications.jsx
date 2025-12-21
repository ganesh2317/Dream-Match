import React from 'react';
import GlassCard from './GlassCard';
import { Bell, Zap, Heart, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const { user } = useAuth();

    // Combine sent and received matches as notifications
    const matches = [
        ...(user?.receivedMatches || []).map(m => ({
            id: m.id,
            type: 'match',
            user: m.sender,
            score: m.score,
            createdAt: m.createdAt,
            status: m.status
        })),
        ...(user?.sentMatches || []).map(m => ({
            id: m.id,
            type: 'match',
            user: m.receiver,
            score: m.score,
            createdAt: m.createdAt,
            status: m.status
        }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '60px' }} className="fade-in">
            <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 800 }}>Vibrations</h2>

            {matches.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px auto',
                        rotate: '-10deg'
                    }}>
                        <Sparkles size={48} color="var(--primary)" opacity={0.6} />
                    </div>
                    <h3 style={{ marginBottom: '12px', fontSize: '22px' }}>No current notifications</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>But don't worry, you will soon find a match. Keep sharing your visions!</p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {matches.map((notification) => (
                        <GlassCard
                            key={notification.id}
                            style={{
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                background: 'rgba(99, 102, 241, 0.03)'
                            }}
                            className="hover-bg"
                        >
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={notification.user?.avatarUrl}
                                    style={{ width: '56px', height: '56px', borderRadius: '18px', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary)', borderRadius: '50%', padding: '4px', border: '3px solid var(--bg-dark)' }}>
                                    <Zap size={10} color="white" fill="white" />
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: 700 }}>
                                    New <span style={{ color: 'var(--primary)' }}>Dream Match</span> found!
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    Your visions resonate with <b>@{notification.user?.username}</b>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    {new Date(notification.createdAt).toLocaleDateString()} • {Math.round(notification.score * 100)}% Match
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--primary)', borderRadius: '10px' }}>
                                    Connect
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
