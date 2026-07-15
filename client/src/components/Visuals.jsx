import React, { useRef, useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Music2, 
    Sparkles, 
    Video, 
    VolumeX, 
    Volume2, 
    Play, 
    Bookmark, 
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
            const res = await fetch('/api/dreams/visuals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVisuals(data);
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
            <GlassCard style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ padding: '24px', background: 'var(--primary-glow)', borderRadius: '50%' }}>
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
            onScroll={handleScroll}
            style={{
                height: 'calc(100vh - 120px)',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                borderRadius: 'var(--radius-xl)',
                background: '#050508',
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

    useEffect(() => {
        if (shouldLoad) {
            console.log(`[Visuals] Video player diagnostic:`, {
                videoUrl: dream.videoUrl,
                videoStatus: dream.videoStatus,
                provider: dream.videoProvider,
                dreamId: dream.id
            });
        }
    }, [shouldLoad, dream]);

    // Prevent duplicate view triggers on rapid toggles
    const viewTriggered = useRef(false);

    // Hoisted helper method for logging views to avoid linter warnings
    async function incrementView() {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/dreams/${dream.id}/view`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error('Error logging view:', e);
        }
    }

    useEffect(() => {
        setLiked(dream.isLiked || false);
        setLikeCount(dream._count?.likes || 0);
    }, [dream.isLiked, dream._count?.likes]);

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
    }, [isActive, shouldLoad]);

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
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

    const handleSave = (e) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
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
            {/* Media Area */}
            {shouldLoad ? (
                <div 
                    onClick={handleVideoClick} 
                    onDoubleClick={handleImageDoubleClick}
                    style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                >
                    <video
                        ref={videoRef}
                        src={dream.videoUrl}
                        loop
                        muted={isMuted}
                        playsInline
                        onLoadStart={() => setIsLoading(true)}
                        onCanPlay={() => setIsLoading(false)}
                        onError={() => {
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
                        onClick={() => alert('Comments drawer toggles')}
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
                    onClick={() => alert('Dream visual shared!')}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
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
                    
                    {/* Generated label */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: '#c084fc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <Sparkles size={10} />
                        {dream.videoProvider || 'AI Generated'}
                    </div>
                </div>

                {/* Dream Title */}
                <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 800, 
                    color: 'white', 
                    marginBottom: '6px', 
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
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
