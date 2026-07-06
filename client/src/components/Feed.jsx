import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { Flame, Heart, MessageCircle, Eye, Share2, Sparkles, Send } from 'lucide-react';

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

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const FeedItem = ({ dream, onLike, onRefresh, onViewVisual }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const user = dream.user || {};
    const avatar = user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`;
    const username = user.username || 'dreamer';
    const streak = user.streakCount || 0;
    const likes = dream._count?.likes || 0;
    const commentsCount = dream._count?.comments || 0;
    const views = dream.views || 0;
    const comments = dream.comments || [];

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
        <GlassCard style={{ padding: '0', overflow: 'hidden', border: 'none' }} className="fade-in">
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' }}>
                <img src={avatar} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)', objectFit: 'cover' }} />
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
                    onDoubleClick={onLike}
                />
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                    {dream.videoUrl && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewVisual(dream.id);
                            }}
                            style={{ background: 'var(--primary-gradient)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
                        >
                            <Sparkles size={14} /> Watch Visual
                        </div>
                    )}
                    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'white' }}>
                        <Eye size={14} /> {views}
                    </div>
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
                        onClick={onLike}
                        style={{
                            background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px',
                            color: dream.isLiked ? 'var(--error)' : 'var(--text-secondary)',
                            fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none'
                        }}
                    >
                        <Heart size={22} fill={dream.isLiked ? 'currentColor' : 'none'} style={{ transition: 'all 0.2s' }} />
                        <span>{likes}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{
                            background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px',
                            color: showComments ? 'var(--primary)' : 'var(--text-secondary)',
                            fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none'
                        }}
                    >
                        <MessageCircle size={22} />
                        <span>{commentsCount}</span>
                    </button>

                    <button style={{ marginLeft: 'auto', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, boxShadow: 'none', transform: 'none' }}>
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Comments Section Drawer */}
                {showComments && (
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Comments</h4>
                        
                        {comments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '16px 0', fontStyle: 'italic' }}>
                                No comments on this dream yet. Be the first to share your thoughts!
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                                {comments.map((comment) => {
                                    const commentUser = comment.user || {};
                                    const commentAvatar = commentUser.avatarUrl || `https://ui-avatars.com/api/?name=${commentUser.username}&background=random`;
                                    return (
                                        <div key={comment.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <img src={commentAvatar} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'white' }}>{commentUser.username || 'dreamer'}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Share your perspective..."
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || submitting}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: commentText.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default Feed;
