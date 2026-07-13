import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Sparkles, MessageCircle, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Matches = ({ onMessage }) => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dreams/matches', {
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
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Matches</h2>

            {matches.length === 0 ? (
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
                        <Sparkles size={32} color="var(--primary)" style={{ opacity: 0.6 }} />
                    </div>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>A match will surely find you</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                        When someone shares a similar vision to yours, they'll appear here automatically.
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <AnimatePresence>
                        {matches.map((match, idx) => {
                            const otherUser = match.senderId === user.id ? match.receiver : match.sender;
                            return (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    <GlassCard style={{ padding: '20px', border: 'var(--glass-border)' }} className="hover-scale-subtle">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                            <img
                                                src={otherUser.avatarUrl}
                                                style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.06)' }}
                                                alt="avatar"
                                            />
                                            <div style={{ flex: 1, minWidth: '180px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{otherUser.fullName}</span>
                                                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '3px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 800 }}>
                                                        {Math.round(match.score * 100)}% Match
                                                    </div>
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>@{otherUser.username}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                                                    <Zap size={12} fill="var(--primary)" /> Shared a vision with you
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onMessage(otherUser)}
                                                    style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', boxShadow: 'none', transform: 'none' }}
                                                >
                                                    <MessageCircle size={16} />
                                                </motion.button>
                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: 'var(--primary-gradient)' }}
                                                >
                                                    Connect
                                                </motion.button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Matches;
