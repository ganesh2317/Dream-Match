import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import Notifications from '../components/Notifications';
import Matches from '../components/Matches';
import Messages from '../components/Messages';
import Profile from '../components/Profile';
import Search from '../components/Search';
import Visuals from '../components/Visuals';
import BottomNavigation from '../components/BottomNavigation';
import { Moon, X, Sparkles, Wand2, Zap, Flame, PlusSquare, Bell, LogOut, MessageCircle, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'feed');
    const [initialVisualId, setInitialVisualId] = useState(null);
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [messageUser, setMessageUser] = useState(null);
    const [dbMatches, setDbMatches] = useState([]);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

    const fetchDreams = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch('/api/dreams', { headers });
            if (res.ok) {
                const data = await res.json();
                setDreams(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/dreams/matches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDbMatches(data.slice(0, 3)); // show top 3 on dashboard sidebar
            }
        } catch (error) {
            console.error('Error fetching dashboard matches:', error);
        }
    };

    useEffect(() => {
        fetchDreams();
        fetchMatches();
        const interval = setInterval(() => {
            fetchDreams();
            fetchMatches();
        }, 10000);

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 992);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('activeTab');
        localStorage.removeItem('selectedChatUser');
        logout();
    };

    const handleOpenMessage = (user) => {
        setMessageUser(user);
        setViewingUser(null);
        setActiveTab('messages');
    };

    const renderContent = () => {
        if (viewingUser) {
            return <Profile user={viewingUser} onBack={() => setViewingUser(null)} onMessage={handleOpenMessage} onViewVisual={(id) => {
                setInitialVisualId(id);
                setActiveTab('visuals');
            }} />;
        }

        switch (activeTab) {
            case 'feed': return <Feed dreams={dreams} loading={loading} onRefresh={fetchDreams} onViewVisual={(id) => {
                setInitialVisualId(id);
                setActiveTab('visuals');
            }} />;
            case 'search': return <Search onViewProfile={setViewingUser} />;
            case 'messages': return <Messages currentUser={user} initialUser={messageUser} onClearInitial={() => setMessageUser(null)} />;
            case 'matches': return <Matches onMessage={handleOpenMessage} />;
            case 'notifications': return <Notifications />;
            case 'visuals': return <Visuals dreams={dreams} onRefresh={fetchDreams} initialDreamId={initialVisualId} />;
            case 'profile': return <Profile user={user} onViewVisual={(id) => {
                setInitialVisualId(id);
                setActiveTab('visuals');
            }} />;
            default: return <Feed dreams={dreams} loading={loading} onRefresh={fetchDreams} />;
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            height: '100vh',
            background: isMobile ? 'transparent' : 'var(--bg-gradient)',
            padding: isMobile ? '0' : '24px',
            gap: isMobile ? '0' : '24px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Mobile Header */}
            {isMobile && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 20px', 
                    background: 'rgba(10, 10, 15, 0.7)', 
                    backdropFilter: 'var(--glass-blur)', 
                    WebkitBackdropFilter: 'var(--glass-blur)', 
                    borderBottom: 'var(--glass-border)', 
                    zIndex: 100 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo-mark.svg" style={{ width: '28px', height: '28px', display: 'block' }} alt="DreamMatch Logo" />
                        <span style={{ 
                            fontWeight: 800, 
                            fontSize: '20px', 
                            letterSpacing: '-0.03em',
                            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>DreamMatch</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ff9f43', background: 'rgba(255, 159, 67, 0.1)', padding: '5px 10px', borderRadius: '100px', fontWeight: 700 }}>
                            <Flame size={14} fill="#ff9f43" /> {user?.streakCount || 0}
                        </div>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            style={{ 
                                background: activeTab === 'notifications' ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                color: 'white',
                                padding: '8px', 
                                borderRadius: '10px',
                                boxShadow: 'none',
                                transform: 'none'
                            }}
                        >
                            <Bell size={18} />
                        </button>
                        <button
                            onClick={() => setActiveTab('matches')}
                            style={{ 
                                background: activeTab === 'matches' ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                color: 'white',
                                padding: '8px', 
                                borderRadius: '10px',
                                boxShadow: 'none',
                                transform: 'none'
                            }}
                        >
                            <Zap size={18} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ 
                                background: 'var(--primary-gradient)', 
                                padding: '8px 12px', 
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px var(--primary-glow)'
                            }}
                        >
                            <PlusSquare size={16} />
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                padding: '8px',
                                borderRadius: '10px',
                                boxShadow: 'none',
                                transform: 'none'
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setShowCreateModal={setShowCreateModal}
                    user={user}
                    logout={handleLogout}
                />
            )}

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: isMobile ? '16px 16px 96px 16px' : '0 8px', 
                scrollBehavior: 'smooth' 
            }} className="hide-scrollbar">
                {renderContent()}
            </div>

            {/* Right Sidebar (Desktop only) */}
            {!isMobile && (
                <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <GlassCard style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Your Streak</h3>
                            <div style={{ background: 'rgba(99, 102, 241, 0.12)', padding: '8px', borderRadius: '10px' }}>
                                <Flame color="var(--primary)" fill="var(--primary)" size={18} />
                            </div>
                        </div>
                        <div style={{ fontSize: '50px', fontWeight: 800, textAlign: 'center', color: 'white', letterSpacing: '-2px', textShadow: '0 8px 24px rgba(99, 102, 241, 0.25)' }}>
                            {user?.streakCount || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Days Active</div>
                    </GlassCard>

                    <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={18} color="var(--primary)" /> Potential Matches
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dbMatches.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                                    No matches found yet. Share more dreams to connect!
                                </div>
                            ) : (
                                dbMatches.map(match => {
                                    const otherUser = match.senderId === user.id ? match.receiver : match.sender;
                                    return (
                                        <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' }} className="hover-bg"
                                            onClick={() => handleOpenMessage(otherUser)}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <img src={otherUser.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>{otherUser.username}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>{Math.round(match.score * 100)}% Match</div>
                                            </div>
                                            <Zap size={14} color="var(--primary)" fill="var(--primary)" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button onClick={() => setActiveTab('matches')} style={{ marginTop: 'auto', width: '100%', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', padding: '12px' }}>View All</button>
                    </GlassCard>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {/* Create Dream Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateDreamModal user={user} onClose={() => setShowCreateModal(false)} onPosted={fetchDreams} />
                )}
            </AnimatePresence>
        </div>
    );
};

const CreateDreamModal = ({ user, onClose, onPosted }) => {
    const [step, setStep] = useState(1);
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('surreal');
    const [images, setImages] = useState([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [generating, setGenerating] = useState(false);

    const [loadingStates, setLoadingStates] = useState([false, false, false, false]);
    const [videoLoading, setVideoLoading] = useState(false);
    const [failedStates, setFailedStates] = useState([false, false, false, false]);
    const [videoFailed, setVideoFailed] = useState(false);
    const [variationsMeta, setVariationsMeta] = useState([]);
    const [videoMeta, setVideoMeta] = useState(null);

    const STYLES = [
        { id: 'surreal', label: 'Surrealism', emoji: '🌌' },
        { id: 'ethereal', label: 'Ethereal', emoji: '✨' },
        { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆' },
        { id: 'oil', label: 'Oil Painting', emoji: '🎨' },
    ];

    const fetchVariation = async (index, meta, token) => {
        setLoadingStates(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        setFailedStates(prev => {
            const next = [...prev];
            next[index] = false;
            return next;
        });

        try {
            const res = await fetch('/api/dreams/generate-single', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: meta.prompt,
                    seed: meta.seed,
                    width: 512,
                    height: 512
                })
            });

            if (res.ok) {
                const data = await res.json();
                setImages(prev => {
                    const next = [...prev];
                    next[index] = data.image;
                    return next;
                });
            } else {
                setFailedStates(prev => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                });
            }
        } catch (error) {
            console.error(`Error loading variation ${index}:`, error);
            setFailedStates(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
        } finally {
            setLoadingStates(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    const fetchVideo = async (meta, token) => {
        setVideoLoading(true);
        setVideoFailed(false);
        try {
            const res = await fetch('/api/dreams/generate-single', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: meta.prompt,
                    seed: meta.seed,
                    width: 512,
                    height: 896
                })
            });

            if (res.ok) {
                const data = await res.json();
                setVideoUrl(data.image);
            } else {
                setVideoFailed(true);
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setVideoFailed(true);
        } finally {
            setVideoLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!description) return;
        setGenerating(true);
        setStep(2);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dreams/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description: `${description} (${style} style)` })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.pending) {
                    setVariationsMeta(data.variations);
                    setVideoMeta(data.video);
                    setImages([null, null, null, null]);
                    setLoadingStates([true, true, true, true]);
                    setFailedStates([false, false, false, false]);

                    // Sequentially fetch all 4 variations
                    for (let i = 0; i < data.variations.length; i++) {
                        await fetchVariation(i, data.variations[i], token);
                    }
                    await fetchVideo(data.video, token);
                } else {
                    setImages(data.images);
                    setVideoUrl(data.videoUrl);
                    setLoadingStates([false, false, false, false]);
                    setVideoLoading(false);
                }
            } else {
                alert('Failed to initialize image generation');
                setStep(1);
            }
        } catch (error) {
            console.error(error);
            alert('Error generating images');
            setStep(1);
        } finally {
            setGenerating(false);
        }
    };

    const handleRetryVariation = async (index) => {
        const token = localStorage.getItem('token');
        const meta = variationsMeta[index];
        if (meta && token) {
            await fetchVariation(index, meta, token);
        }
    };

    const handleRetryVideo = async () => {
        const token = localStorage.getItem('token');
        if (videoMeta && token) {
            await fetchVideo(videoMeta, token);
        }
    };

    const handlePost = async () => {
        if (!selectedImage) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dreams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description,
                    imageUrl: selectedImage,
                    videoUrl: videoUrl
                })
            });

            if (res.ok) {
                onPosted();
                onClose();
            } else {
                alert('Failed to post dream');
            }
        } catch (e) {
            console.error(e);
            alert('Error posting dream');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', 
                inset: 0, 
                background: 'rgba(5, 5, 8, 0.85)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backdropFilter: 'blur(16px)', 
                zIndex: 1000, 
                padding: '20px' 
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                style={{ width: '100%', maxWidth: '640px', zIndex: 1001 }}
            >
                <GlassCard style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }} className="hide-scrollbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{step === 1 ? 'Visualize Your Dream' : 'Choose Your Vision'}</h2>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px', borderRadius: '50%', boxShadow: 'none' }}><X size={16} /></button>
                    </div>

                    {step === 1 ? (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Describe what you saw</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A crystal castle floating above a sea of neon clouds..."
                                    style={{
                                        width: '100%',
                                        height: '130px',
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'var(--primary)';
                                        e.target.style.boxShadow = 'var(--focus-ring)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Dream Style</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {STYLES.map(s => (
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={s.id}
                                            onClick={() => setStyle(s.id)}
                                            style={{
                                                padding: '14px 6px',
                                                borderRadius: 'var(--radius-md)',
                                                border: style === s.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                                background: style === s.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                                                boxShadow: style === s.id ? 'var(--focus-ring)' : 'none',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                        >
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.emoji}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 700 }}>{s.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleGenerate}
                                disabled={generating || !description}
                                style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)' }}
                            >
                                {generating ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                                        <span>Subconscious visualizing...</span>
                                    </div>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wand2 size={18} /> Generate Visions</span>
                                )}
                            </motion.button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Status: </span>
                                {images.filter(Boolean).length === 4 ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>Visions complete! Select one to share.</span>
                                ) : (
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                        Synthesizing dreams sequentially ({images.filter(Boolean).length}/4 loaded)...
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {[0, 1, 2, 3].map((index) => {
                                    const img = images[index];
                                    const isLoading = loadingStates[index];
                                    const isFailed = failedStates[index];

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => img && setSelectedImage(img)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: 'var(--radius-lg)',
                                                overflow: 'hidden',
                                                cursor: img ? 'pointer' : 'default',
                                                border: selectedImage === img && img ? '3px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                                background: 'rgba(255,255,255,0.01)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                boxShadow: selectedImage === img && img ? '0 0 16px var(--primary-glow)' : 'none'
                                            }}
                                            className={isLoading ? "shimmer" : ""}
                                        >
                                            {isLoading ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Visualizing...</span>
                                                </div>
                                            ) : isFailed ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '11px', color: '#ff7675', fontWeight: 700 }}>Timed out</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRetryVariation(index); }}
                                                        style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : img ? (
                                                <>
                                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`variation ${index + 1}`} />
                                                    {selectedImage === img && (
                                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', borderRadius: '50%', padding: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                                            <Zap size={14} color="white" fill="white" />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Waiting...</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                                {videoFailed && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', fontSize: '12px', color: '#ff7675' }}>
                                        <span>Video/Reel generation failed.</span>
                                        <button onClick={handleRetryVideo} style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Retry Video</button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'white', fontSize: '14px' }}>Back</button>
                                    <button
                                        onClick={handlePost}
                                        disabled={!selectedImage || videoLoading}
                                        style={{ flex: 1, padding: '14px', fontSize: '14px' }}
                                    >
                                        {videoLoading ? 'Generating Reel...' : 'Share Vision'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
