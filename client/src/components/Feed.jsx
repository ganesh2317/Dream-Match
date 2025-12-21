import React from 'react';
import GlassCard from './GlassCard';
import { Flame, Heart, MessageCircle, Eye } from 'lucide-react';

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
        <>
            <h2 style={{ marginBottom: '24px' }}>Timeline</h2>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
                    Loading dreams...
                </div>
            ) : dreams.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    No dreams logged yet.<br />Tap <b>Post Dream</b> to start your streak!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                    {dreams.map((dream) => {
                        const user = dream.user || {};
                        // Fallback for older data if any, or API structure
                        const avatar = user.avatarUrl || dream.userAvatar;
                        const username = user.username || dream.username;
                        const streak = user.streakCount || dream.userStreak || 0;
                        const likes = dream._count?.likes || 0;
                        const comments = dream._count?.comments || 0;
                        const views = (dream.views || 0) + (dream._count?.views || 0); // views is Int field on Dream

                        return (
                            <GlassCard key={dream.id} style={{ transition: 'transform 0.2s' }} className="feed-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <img src={avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{username}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {new Date(dream.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {/* Show streak badge if user has one */}
                                    {streak > 0 && (
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ffa502', background: 'rgba(255, 165, 0, 0.15)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
                                            <Flame size={14} fill="#ffa502" /> {streak}
                                        </div>
                                    )}
                                </div>

                                <div style={{ position: 'relative', height: '400px', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <img src={dream.imageUrl} alt="dream" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>{dream.description}</h3>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button
                                        onClick={() => handleLike(dream.id)}
                                        style={{
                                            background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px',
                                            color: dream.isLiked ? 'var(--error)' : 'var(--text-secondary)',
                                            fontSize: '14px', fontWeight: 500
                                        }}
                                    >
                                        <Heart size={20} fill={dream.isLiked ? 'currentColor' : 'none'} /> {likes}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        <MessageCircle size={20} /> {comments}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginLeft: 'auto' }}>
                                        <Eye size={20} /> {dream.views || 0}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default Feed;
