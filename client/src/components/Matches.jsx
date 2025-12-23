import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Sparkles, MessageCircle, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Matches = ({ onMessage }) => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/matches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 800 }}>Dream Matches</h2>

            {matches.length === 0 ? (
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
                    <h3 style={{ marginBottom: '12px', fontSize: '22px' }}>A match will surely find you</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                        When someone shares a similar vision to yours, they'll appear here automatically.
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {matches.map((match) => {
                        const otherUser = match.senderId === user.id ? match.receiver : match.sender;
                        return (
                            <GlassCard key={match.id} style={{ padding: '24px' }} className="hover-bg">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <img
                                        src={otherUser.avatarUrl}
                                        style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '17px' }}>{otherUser.fullName}</span>
                                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>
                                                {Math.round(match.score * 100)}% MATCH
                                            </div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>@{otherUser.username}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                                            <Zap size={14} fill="var(--primary)" /> Shared a vision with you
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => onMessage(otherUser)}
                                            style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <button style={{ padding: '10px 20px', borderRadius: '12px' }}>
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Matches;
