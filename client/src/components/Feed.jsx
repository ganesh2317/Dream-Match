import React from 'react';
import GlassCard from './GlassCard';
import { Flame, Heart, MessageCircle, Eye, Share2 } from 'lucide-react';

const Feed = ({ dreams, loading, onRefresh }) => {

    const handleLike = async (dreamId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await fetch(`http://localhost:3000/api/dreams/${dreamId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            onRefresh();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 800 }}>Explore Dreams</h2>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Peeking into the dream world...</p>
                </div>
            ) : dreams.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <h3 style={{ marginBottom: '12px' }}>No dreams here yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The world is waiting to see your visions. Be the first to share!</p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
                    {dreams.map((dream) => {
                        const user = dream.user || {};
                        const avatar = user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`;
                        const username = user.username || 'dreamer';
                        const streak = user.streakCount || 0;
                        const likes = dream._count?.likes || 0;
                        const comments = dream._count?.comments || 0;
                        const views = dream.views || 0;

                        return (
                            <GlassCard key={dream.id} style={{ padding: '0', overflow: 'hidden', border: 'none' }} className="fade-in">
                                {/* Card Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' }}>
                                    <img src={avatar} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{username}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {new Date(dream.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    {streak > 0 && (
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ff9f43', background: 'rgba(255, 159, 67, 0.1)', padding: '6px 12px', borderRadius: '100px', fontWeight: 700 }}>
                                            <Flame size={14} fill="#ff9f43" /> {streak}
                                        </div>
                                    )}
                                </div>

                                {/* Dream Image */}
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1.2/1', background: '#050505', overflow: 'hidden' }}>
                                    <img
                                        src={dream.imageUrl}
                                        alt="dream"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onDoubleClick={() => handleLike(dream.id)}
                                    />
                                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'white' }}>
                                        <Eye size={14} /> {views}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div style={{ padding: '24px' }}>
                                    <p style={{ fontSize: '17px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 400 }}>
                                        {dream.description}
                                    </p>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button
                                            onClick={() => handleLike(dream.id)}
                                            style={{
                                                background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px',
                                                color: dream.isLiked ? 'var(--error)' : 'var(--text-secondary)',
                                                fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none'
                                            }}
                                        >
                                            <Heart size={22} fill={dream.isLiked ? 'currentColor' : 'none'} style={{ transition: 'all 0.2s' }} />
                                            <span>{likes}</span>
                                        </button>

                                        <button style={{ background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none' }}>
                                            <MessageCircle size={22} />
                                            <span>{comments}</span>
                                        </button>

                                        <button style={{ marginLeft: 'auto', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none' }}>
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Feed;
