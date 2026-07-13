import React, { useRef, useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Heart, MessageCircle, Share2, User, Music2, Sparkles, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const Visuals = ({ dreams, onRefresh, initialDreamId }) => {
    const containerRef = useRef(null);

    const visuals = [...dreams].filter(d => d.videoUrl).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    useEffect(() => {
        if (initialDreamId && containerRef.current && visuals.length > 0) {
            const index = visuals.findIndex(v => v.id === initialDreamId);
            if (index !== -1) {
                setTimeout(() => {
                    if (containerRef.current) {
                        const height = containerRef.current.offsetHeight;
                        containerRef.current.scrollTo({
                            top: index * height,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        }
    }, [initialDreamId, visuals.length]);

    if (visuals.length === 0) {
        return (
            <GlassCard style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', border: 'var(--glass-border)' }}>
                <div style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                    <Video size={40} color="var(--primary)" style={{ opacity: 0.6 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>No visuals yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Share a dream to see its animation here!</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                height: 'calc(100vh - 120px)',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                borderRadius: 'var(--radius-lg)',
                background: '#050508',
                border: 'var(--glass-border)'
            }}
            className="hide-scrollbar"
        >
            {visuals.map((dream) => (
                <VisualItem key={dream.id} dream={dream} onRefresh={onRefresh} />
            ))}
        </div>
    );
};

const VisualItem = ({ dream, onRefresh }) => {
    const [liked, setLiked] = useState(dream.isLiked || false);
    const [likeCount, setLikeCount] = useState(dream._count?.likes || 0);

    useEffect(() => {
        setLiked(dream.isLiked || false);
        setLikeCount(dream._count?.likes || 0);
    }, [dream.isLiked, dream._count?.likes]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const nextLiked = !liked;
            setLiked(nextLiked);
            setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

            const res = await fetch(`/api/dreams/${dream.id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLiked(data.liked);
                if (onRefresh) onRefresh();
            }
        } catch (e) {
            console.error(e);
            setLiked(dream.isLiked || false);
            setLikeCount(dream._count?.likes || 0);
        }
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050508',
            overflow: 'hidden'
        }}>
            {/* Main Visual */}
            <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src={dream.videoUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.75
                    }}
                    alt="Dream Visual"
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,8,0.2) 0%, rgba(5,5,8,0.85) 100%)'
                }}></div>
            </div>

            {/* Right Side Actions Column */}
            <div style={{
                position: 'absolute',
                right: '20px',
                bottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Heart size={20} color={liked ? "#ff4757" : "white"} fill={liked ? "#ff4757" : "none"} />
                    </motion.div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{likeCount}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <MessageCircle size={20} color="white" />
                    </motion.div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{dream._count?.comments || 0}</span>
                </div>

                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Share2 size={18} color="white" />
                </motion.div>
            </div>

            {/* Bottom Info Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                right: '80px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <img src={dream.user?.avatarUrl} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} alt="avatar" />
                    <div style={{ fontWeight: 700, fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.6)', color: 'white' }}>@{dream.user?.username}</div>
                    <button style={{ padding: '5px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontWeight: 700 }}>Follow</button>
                </div>

                <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255,255,255,0.95)', marginBottom: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontWeight: 400 }}>
                    {dream.description}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', opacity: 0.85 }}>
                    <Music2 size={14} />
                    <span className="marquee-text" style={{ fontSize: '12px', fontWeight: 600 }}>Original Visual Sound - {dream.user?.username}</span>
                </div>
            </div>
        </div>
    );
};

export default Visuals;
