import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { Flame, Heart, MessageCircle, Eye, Share2, Sparkles, Send, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Feed = ({ dreams, loading, onRefresh, onViewVisual }) => {
    const handleLike = async (dreamId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await fetch(`/api/dreams/${dreamId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            onRefresh();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Dreams</h2>
            </div>

            {loading ? (
                <FeedSkeleton />
            ) : dreams.length === 0 ? (
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
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>No dreams here yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                        The subconscious world is waiting. Share your first vision with the network.
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
                    {dreams.map((dream) => (
                        <FeedItem
                            key={dream.id}
                            dream={dream}
                            onLike={() => handleLike(dream.id)}
                            onRefresh={onRefresh}
                            onViewVisual={onViewVisual}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FeedSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[1, 2].map((i) => (
            <GlassCard key={i} style={{ padding: '0', overflow: 'hidden', border: 'var(--glass-border)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                    <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="shimmer" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                        <div className="shimmer" style={{ width: '60px', height: '10px', borderRadius: '4px' }} />
                    </div>
                </div>
                {/* Image Placeholder */}
                <div className="shimmer" style={{ width: '100%', aspectRatio: '1.3/1' }} />
                {/* Content */}
                <div style={{ padding: '20px' }}>
                    <div className="shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '8px' }} />
                    <div className="shimmer" style={{ width: '70%', height: '14px', borderRadius: '4px' }} />
                </div>
            </GlassCard>
        ))}
    </div>
);

const FeedItem = ({ dream, onLike, onRefresh, onViewVisual }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);

    const user = dream.user || {};
    const avatar = user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`;
    const username = user.username || 'dreamer';
    const streak = user.streakCount || 0;
    const likes = dream._count?.likes || 0;
    const commentsCount = dream._count?.comments || 0;
    const views = dream.views || 0;
    const comments = dream.comments || [];

    const handleImageDoubleClick = (e) => {
        e.preventDefault();
        onLike();
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 800);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || submitting) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/dreams/${dream.id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText.trim() })
            });

            if (res.ok) {
                setCommentText('');
                onRefresh();
            } else {
                alert('Failed to post comment');
            }
        } catch (error) {
            console.error(error);
            alert('Error posting comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <GlassCard style={{ padding: '0', overflow: 'hidden', border: 'var(--glass-border)' }} className="hover-scale-subtle">
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
                    <img src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.06)', objectFit: 'cover' }} alt="avatar" />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{username}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(dream.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {streak > 0 && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ff9f43', background: 'rgba(255, 159, 67, 0.1)', padding: '5px 10px', borderRadius: '100px', fontWeight: 700 }}>
                            <Flame size={12} fill="#ff9f43" /> {streak}
                        </div>
                    )}
                </div>

                {/* Dream Image & Overlay */}
                <div 
                    onDoubleClick={handleImageDoubleClick}
                    style={{ position: 'relative', width: '100%', aspectRatio: '1.3/1', background: '#050508', overflow: 'hidden', cursor: 'pointer' }}
                >
                    <img
                        src={dream.imageUrl}
                        alt="dream"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    
                    <AnimatePresence>
                        {showHeartOverlay && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.9] }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ff4757',
                                    zIndex: 5,
                                    pointerEvents: 'none'
                                }}
                            >
                                <Heart size={80} fill="#ff4757" style={{ filter: 'drop-shadow(0 0 12px rgba(255,71,87,0.5))' }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 3 }}>
                        {dream.videoUrl && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewVisual(dream.id);
                                }}
                                style={{ background: 'var(--primary-gradient)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                            >
                                <Sparkles size={12} /> Watch Reel
                            </div>
                        )}
                        <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '5px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'white' }}>
                            <Eye size={12} /> {views}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 400 }}>
                        {dream.description}
                    </p>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onLike}
                            style={{
                                background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '6px',
                                color: dream.isLiked ? '#ff4757' : 'var(--text-secondary)',
                                fontSize: '13px', fontWeight: 600, boxShadow: 'none', transform: 'none'
                            }}
                        >
                            <Heart size={20} fill={dream.isLiked ? '#ff4757' : 'none'} style={{ transition: 'color var(--transition-fast)' }} />
                            <span>{likes}</span>
                        </motion.button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            style={{
                                background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '6px',
                                color: showComments ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '13px', fontWeight: 600, boxShadow: 'none', transform: 'none'
                            }}
                        >
                            <MessageCircle size={20} />
                            <span>{commentsCount}</span>
                        </button>

                        <button style={{ marginLeft: 'auto', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, boxShadow: 'none', transform: 'none' }}>
                            <Share2 size={18} />
                        </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Comments</h4>
                                    
                                    {comments.length === 0 ? (
                                        <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '12px 0', fontStyle: 'italic' }}>
                                            No comments yet. Share your thoughts!
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                                            {comments.map((comment) => {
                                                const commentUser = comment.user || {};
                                                const commentAvatar = commentUser.avatarUrl || `https://ui-avatars.com/api/?name=${commentUser.username}&background=random`;
                                                return (
                                                    <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                        <img src={commentAvatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="comment-avatar" />
                                                        <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '12px', color: 'white' }}>{commentUser.username || 'dreamer'}</span>
                                                                <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Comment Input */}
                                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                background: 'rgba(0,0,0,0.2)',
                                                color: 'white',
                                                fontSize: '13px',
                                                outline: 'none',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim() || submitting}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: commentText.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                                color: 'white',
                                                boxShadow: 'none',
                                                transform: 'none'
                                            }}
                                        >
                                            <Send size={14} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default Feed;
