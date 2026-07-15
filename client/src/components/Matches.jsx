import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Sparkles, MessageCircle, Zap, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Matches = ({ onMessage }) => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTwinIndex, setSelectedTwinIndex] = useState(0);
    const [twinDreams, setTwinDreams] = useState([]);
    const [loadingTwinDreams, setLoadingTwinDreams] = useState(false);

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

    // Active twin user to showcase
    const activeMatch = matches[selectedTwinIndex];
    const twinUser = activeMatch 
        ? (activeMatch.senderId === user.id ? activeMatch.receiver : activeMatch.sender)
        : null;

    // Fetch active twin's dreams dynamically to extract a similar dream description
    useEffect(() => {
        if (!twinUser) return;
        const fetchTwinProfile = async () => {
            setLoadingTwinDreams(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/users/profile/${twinUser.username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTwinDreams(data.dreams || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingTwinDreams(false);
            }
        };
        fetchTwinProfile();
    }, [twinUser]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Dream Match</h2>
                <GlassCard style={{ textAlign: 'center', padding: '64px 32px', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.1)',
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
            </div>
        );
    }

    // Similar dream text extraction
    const similarDreamText = twinDreams.length > 0 
        ? twinDreams[0].description
        : "I was flying over a city at sunset and felt truly free.";

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Dream Match</h2>

            {/* Featured Match Twin Card */}
            {twinUser && (
                <GlassCard style={{
                    padding: '36px 28px',
                    border: 'var(--glass-border)',
                    borderRadius: 'var(--radius-2xl)',
                    background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, var(--glass-bg) 70%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: 'var(--glass-shadow)'
                }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '20px' }}>Your Dream Twin</span>
                    
                    {/* Glowing Circular Avatar */}
                    <div style={{ position: 'relative', marginBottom: '18px' }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-8px',
                            borderRadius: '50%',
                            background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--primary))',
                            animation: 'spin 6s linear infinite',
                            opacity: 0.8,
                            filter: 'blur(3px)'
                        }} />
                        <img 
                            src={twinUser.avatarUrl} 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                border: '4px solid #07070a', 
                                objectFit: 'cover',
                                zIndex: 1,
                                position: 'relative'
                            }} 
                            alt="twin-avatar"
                        />
                    </div>

                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {twinUser.fullName || twinUser.username}
                    </h3>
                    <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} fill="var(--primary)" /> {Math.round(activeMatch.score * 100)}% Match
                    </div>

                    {/* Similar Dream Display */}
                    <div style={{
                        width: '100%',
                        padding: '18px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border-light)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'left',
                        marginBottom: '28px'
                    }}>
                        <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 700, marginBottom: '8px' }}>Similar Dream</h4>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                            {loadingTwinDreams ? 'Loading subconscious links...' : `"${similarDreamText}"`}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onMessage(twinUser)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 8px 20px var(--primary-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        Start Conversation <ArrowRight size={16} />
                    </motion.button>
                </GlassCard>
            )}

            {/* More Dreamers Like You Section */}
            {matches.length > 1 && (
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.2px' }}>
                        More Dreamers Like You
                    </h3>
                    <div style={{
                        display: 'flex',
                        gap: '14px',
                        overflowX: 'auto',
                        paddingBottom: '10px'
                    }} className="hide-scrollbar">
                        {matches.map((match, idx) => {
                            const other = match.senderId === user.id ? match.receiver : match.sender;
                            const isCurrentSelected = idx === selectedTwinIndex;

                            return (
                                <motion.div
                                    key={match.id}
                                    whileHover={{ y: -2 }}
                                    onClick={() => setSelectedTwinIndex(idx)}
                                    style={{
                                        minWidth: '130px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <GlassCard style={{
                                        padding: '14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        border: isCurrentSelected ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                        background: isCurrentSelected ? 'var(--primary-glow)' : 'var(--glass-bg)',
                                        borderRadius: 'var(--radius-xl)'
                                    }}>
                                        <img 
                                            src={other.avatarUrl} 
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px', border: isCurrentSelected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)' }} 
                                            alt="other-avatar"
                                        />
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', marginBottom: '2px' }}>
                                            {other.username}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 800 }}>
                                            {Math.round(match.score * 100)}% Match
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Matches;
