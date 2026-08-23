import React, { useRef, useState, useEffect, useCallback } from 'react';
import GlassCard from './GlassCard';
import { getMediaUrl } from '../utils/api';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Sparkles, 
    Video, 
    VolumeX, 
    Volume2, 
    Play, 
    Bookmark,
    Music2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Visuals = ({ initialDreamId, onViewProfile }) => {
    const containerRef = useRef(null);
    const [visuals, setVisuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const fetchVisuals = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getMediaUrl('/api/dreams/visuals'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const validVisuals = (data || []).filter(v => v && v.user);
                setVisuals(validVisuals);
            }
        } catch (e) {
            console.error('Error fetching visuals:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisuals();
    }, []);

    // Set scroll position to initialDreamId if provided
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
                        setActiveIndex(index);
                    }
                }, 150);
            }
        }
    }, [initialDreamId, visuals.length]);

    const handleScroll = (e) => {
        const scrollTop = e.currentTarget.scrollTop;
        const height = e.currentTarget.clientHeight;
        if (height > 0) {
            const index = Math.round(scrollTop / height);
            if (index !== activeIndex && index >= 0 && index < visuals.length) {
                setActiveIndex(index);
            }
        }
    };

    if (loading) {
        return (
            <GlassCard style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                <div className="loading-spinner" />
            </GlassCard>
        );
    }

    if (visuals.length === 0) {
        return (
            <GlassCard level="float" style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(79, 111, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'phosphorPulse 4s ease-in-out infinite',
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--phosphor)', opacity: 0.6 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: '8px' }}>Your reel is empty</h3>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fog)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>Post your first dream to generate a visual.<br/>It takes about 30 seconds.</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                height: 'calc(100vh - 120px)',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--ink)',
                border: 'var(--glass-border)'
            }}
            className="hide-scrollbar"
        >
            {visuals.map((dream, index) => (
                <VisualItem 
                    key={dream.id} 
                    dream={dream} 
                    isActive={index === activeIndex}
                    shouldLoad={Math.abs(index - activeIndex) <= 1}
                    onRefresh={fetchVisuals} 
                    onViewProfile={onViewProfile}
                />
            ))}
        </div>
    );
};

const VisualItem = ({ dream, isActive, shouldLoad, onRefresh, onViewProfile }) => {
    const videoRef = useRef(null);
    const [liked, setLiked] = useState(dream.isLiked || false);
    const [likeCount, setLikeCount] = useState(dream._count?.likes || 0);
    const [isMuted, setIsMuted] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);



    // Prevent duplicate view triggers on rapid toggles
    const viewTriggered = useRef(false);

    // Hoisted helper method for logging views to avoid linter warnings
    const incrementView = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(getMediaUrl(`/api/dreams/${dream.id}/view`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error('Error logging view:', e);
        }
    }, [dream.id, onRefresh]);

    useEffect(() => {
        if (liked !== (dream.isLiked || false)) {
            setLiked(dream.isLiked || false);
        }
        if (likeCount !== (dream._count?.likes || 0)) {
            setLikeCount(dream._count?.likes || 0);
        }
    }, [dream.isLiked, dream._count?.likes, liked, likeCount]);

    // Handle play / pause based on intersection state
    useEffect(() => {
        if (!videoRef.current || !shouldLoad) return;

        if (isActive) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.warn('Autoplay prevented:', err);
                    setIsPlaying(false);
                });

            if (!viewTriggered.current) {
                viewTriggered.current = true;
                incrementView();
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, shouldLoad, incrementView]);

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const nextLiked = !liked;
            setLiked(nextLiked);
            setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

            const res = await fetch(getMediaUrl(`/api/dreams/${dream.id}/like`), {
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

    const handleImageDoubleClick = (e) => {
        e.preventDefault();
        if (!liked) {
            handleLike();
        }
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 800);
    };

    const handleVideoClick = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const [toast, setToast] = useState('');
    const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const handleSave = async (e) => {
        if (e) e.stopPropagation();
        const nextSaved = !isSaved;
        setIsSaved(nextSaved);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getMediaUrl(`/api/dreams/${dream.id}/save`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.saved);
                setToast(data.saved ? 'Reel saved to bookmarks' : 'Reel removed from bookmarks');
                setTimeout(() => setToast(''), 2500);
            }
        } catch (err) {
            console.error('Error toggling reel save:', err);
        }
    };

    const handleShare = async (e) => {
        if (e) e.stopPropagation();
        const shareUrl = `${window.location.origin}/?visual=${dream.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setToast('Visual reel link copied!');
        } catch {
            setToast('Reel link: ' + shareUrl);
        }
        setTimeout(() => setToast(''), 2500);
    };


    const openComments = async (e) => {
        if (e) e.stopPropagation();
        setShowCommentsDrawer(true);
        setLoadingComments(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getMediaUrl(`/api/dreams/${dream.id}/comments`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCommentsList(data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getMediaUrl(`/api/dreams/${dream.id}/comment`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: newComment.trim() })
            });
            if (res.ok) {
                setNewComment('');
                openComments();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
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
            background: 'var(--ink)',
            overflow: 'hidden',
            outline: isActive ? '1px solid rgba(79, 111, 255, 0.18)' : 'none',
            boxShadow: isActive ? '0 0 28px rgba(79, 111, 255, 0.12) inset' : 'none',
            transition: 'box-shadow 0.6s ease',
        }}>
            {toast && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--phosphor)', color: '#000', fontSize: '12px', fontWeight: 700,
                        padding: '6px 16px', borderRadius: '100px', zIndex: 50, boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                    }}
                >
                    {toast}
                </motion.div>
            )}

            {/* Media Area */}
            {shouldLoad ? (
                <div 
                    onClick={handleVideoClick} 
                    onDoubleClick={handleImageDoubleClick}
                    style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                >
                    <video
                        ref={videoRef}
                        src={getMediaUrl(dream.videoUrl)}
                        loop
                        muted={isMuted}
                        playsInline
                        crossOrigin="anonymous"
                        onLoadStart={() => setIsLoading(true)}
                        onCanPlay={() => setIsLoading(false)}
                        onError={() => {
                            console.error('Video error event for dream:', dream.id, 'src:', getMediaUrl(dream.videoUrl));
                            setIsError(true);
                            setIsLoading(false);
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    
                    {/* Shadow overlay gradient */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(5,5,8,0.2) 0%, transparent 40%, rgba(5,5,8,0.85) 100%)',
                        pointerEvents: 'none'
                    }} />

                    {/* Mute Overlay Icon */}
                    <button 
                        onClick={toggleMute}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            padding: '10px',
                            background: 'rgba(5, 5, 8, 0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            color: 'white',
                            cursor: 'pointer',
                            zIndex: 11,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    {/* Play Button overlay if paused manually */}
                    {!isPlaying && !isLoading && !isError && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '20px',
                            background: 'rgba(5, 5, 8, 0.6)',
                            borderRadius: '50%',
                            backdropFilter: 'blur(8px)',
                            pointerEvents: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Play size={28} fill="white" style={{ marginLeft: '3px' }} />
                        </div>
                    )}
                </div>
            ) : (
                <img
                    src={dream.imageUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.5
                    }}
                    alt="Dream Preview"
                />
            )}

            {/* Starry Like Double-Tap Heart overlay */}
            <AnimatePresence>
                {showHeartOverlay && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.95] }}
                        exit={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#ff4757',
                            zIndex: 15,
                            pointerEvents: 'none'
                        }}
                    >
                        <Heart size={90} fill="#ff4757" style={{ filter: 'drop-shadow(0 0 16px rgba(255,71,87,0.7))' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Skeleton Loading Spinner */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(5, 5, 8, 0.7)',
                    zIndex: 9
                }}>
                    <div className="loading-spinner" />
                </div>
            )}

            {/* Error Fallback */}
            {(isError || dream.videoStatus === 'FAILED') && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#050508',
                    zIndex: 9,
                    color: 'white',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <AlertCircle size={40} color="#ff4757" />
                    <div style={{ fontWeight: 600 }}>Failed to load video</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {dream.videoStatus === 'FAILED' ? 'The AI generation queue has failed.' : 'The video source could not be played.'}
                    </div>
                </div>
            )}

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
                {/* Like */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                    >
                        <Heart size={20} color={liked ? "#ff4757" : "white"} fill={liked ? "#ff4757" : "none"} />
                    </motion.div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{likeCount}</span>
                </div>

                {/* Comment */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        onClick={openComments}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                    >
                        <MessageCircle size={20} color="white" />
                    </motion.div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{dream._count?.comments || 0}</span>
                </div>

                {/* Save */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSave}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                    >
                        <Bookmark size={20} color={isSaved ? "#fbbf24" : "white"} fill={isSaved ? "#fbbf24" : "none"} />
                    </motion.div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Save</span>
                </div>

                {/* Share */}
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    onClick={handleShare}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                >
                    <Share2 size={18} color="white" />
                </motion.div>
            </div>

            {/* Comments Modal Drawer */}
            <AnimatePresence>
                {showCommentsDrawer && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                    }} onClick={() => setShowCommentsDrawer(false)}>
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ height: '65%', background: '#0a0a0f', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Comments ({commentsList.length})</h3>
                                <button onClick={() => setShowCommentsDrawer(false)} style={{ background: 'transparent', border: 'none', color: 'var(--fog)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                {loadingComments ? (
                                    <div style={{ textAlign: 'center', color: 'var(--fog)', padding: '20px' }}>Loading comments...</div>
                                ) : commentsList.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--fog)', padding: '30px 0' }}>No comments yet. Be the first!</div>
                                ) : (
                                    commentsList.map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                                            <img src={c.user?.avatarUrl} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>@{c.user?.username}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--fog)', marginTop: '2px' }}>{c.text}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={submitComment} style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={newComment} 
                                    onChange={e => setNewComment(e.target.value)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                />
                                <button type="submit" disabled={!newComment.trim()} style={{ padding: '12px 18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                    Post
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Bottom Info Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                right: '80px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <img 
                        src={dream.user?.avatarUrl} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--primary)', objectFit: 'cover', padding: '1px', cursor: 'pointer' }} 
                        alt="avatar" 
                        onClick={() => onViewProfile && onViewProfile(dream.user)}
                    />
                    <div 
                        style={{ fontWeight: 700, fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer' }}
                        onClick={() => onViewProfile && onViewProfile(dream.user)}
                    >
                        @{dream.user?.username}
                    </div>
                    
                    {/* AI badge - phosphor colored */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--phosphor-subtle)',
                        border: '1px solid rgba(79, 111, 255, 0.25)',
                        fontSize: '9px',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        color: 'var(--phosphor)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}>
                        <Sparkles size={9} />
                        {dream.videoProvider || 'AI Generated'}
                    </div>
                </div>

                {/* Dream Title — Fraunces display font */}
                <div style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 600, 
                    fontStyle: 'italic',
                    color: 'rgba(196, 205, 232, 0.95)', 
                    marginBottom: '6px', 
                    textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                    letterSpacing: '-0.01em',
                }}>
                    {dream.theme ? `${dream.theme.charAt(0).toUpperCase() + dream.theme.slice(1)} Dream` : 'Dream Vision'}
                </div>

                <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255,255,255,0.95)', marginBottom: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontWeight: 400 }}>
                    {dream.description}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'white', opacity: 0.85 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {dream.views || 0} views
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Music2 size={14} />
                        <span className="marquee-text" style={{ fontSize: '12px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Original Visual Sound - {dream.user?.username}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Visuals;
