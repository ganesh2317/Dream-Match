import React, { useRef, useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Heart, MessageCircle, Share2, User, Music2, Sparkles, Video } from 'lucide-react';

const Visuals = ({ dreams, onRefresh, initialDreamId }) => {
    const containerRef = useRef(null);

    // Filter dreams that have a videoUrl and sort them (active first or by date)
    const visuals = [...dreams].filter(d => d.videoUrl).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    useEffect(() => {
        if (initialDreamId && containerRef.current && visuals.length > 0) {
            const index = visuals.findIndex(v => v.id === initialDreamId);
            if (index !== -1) {
                // Wait a bit for layout
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
            <div style={{ height: 'calc(100vh - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px' }}>
                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                    <Video size={48} color="var(--primary)" opacity={0.5} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px' }}>No visuals yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Share a dream to see its animation here!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                height: 'calc(100vh - 40px)',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                borderRadius: '24px',
                background: '#000'
            }}
            className="hide-scrollbar"
        >
            {visuals.map((dream) => (
                <VisualItem key={dream.id} dream={dream} onRefresh={onRefresh} />
            ))}
        </div>
    );
};

const VisualItem = ({ dream }) => {
    const [liked, setLiked] = useState(dream.isLiked || false);

    return (
        <div style={{
            height: '100%',
            width: '100%',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000'
        }}>
            {/* Main Visual (Video Simulation) */}
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
                        opacity: 0.8
                    }}
                    alt="Dream Visual"
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8))'
                }}></div>
            </div>

            {/* Right Side Actions */}
            <div style={{
                position: 'absolute',
                right: '20px',
                bottom: '100px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div
                        onClick={() => setLiked(!liked)}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%', cursor: 'pointer' }}
                    >
                        <Heart size={28} color={liked ? "#ff4757" : "white"} fill={liked ? "#ff4757" : "none"} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{dream._count?.likes || 0}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%', cursor: 'pointer' }}>
                        <MessageCircle size={28} color="white" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{dream._count?.comments || 0}</span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%', cursor: 'pointer' }}>
                    <Share2 size={24} color="white" />
                </div>
            </div>

            {/* Bottom Info */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                right: '80px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <img src={dream.user?.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }} />
                    <div style={{ fontWeight: 700, fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>@{dream.user?.username}</div>
                    <button style={{ padding: '6px 16px', fontSize: '12px', background: 'transparent', border: '1px solid white', borderRadius: '8px', color: 'white' }}>Follow</button>
                </div>

                <div style={{ fontSize: '15px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {dream.description}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', opacity: 0.8 }}>
                    <Music2 size={16} />
                    <marquee style={{ width: '150px', fontSize: '13px' }}>Original Visual Sound - {dream.user?.username}</marquee>
                </div>
            </div>
        </div>
    );
};

export default Visuals;
