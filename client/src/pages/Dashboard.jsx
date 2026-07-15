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
import Settings from '../components/Settings';
import BottomNavigation from '../components/BottomNavigation';
import { Moon, X, Sparkles, Wand2, Zap, Flame, PlusSquare, Bell, LogOut, MessageCircle, Heart, Download, Share2, Compass, AlertCircle } from 'lucide-react';
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
            case 'feed': 
                return <Feed dreams={dreams} loading={loading} onRefresh={fetchDreams} onViewVisual={(id) => {
                    setInitialVisualId(id);
                    setActiveTab('visuals');
                }} />;
            case 'search': 
                return <Search onViewProfile={setViewingUser} />;
            case 'messages': 
                return <Messages currentUser={user} initialUser={messageUser} onClearInitial={() => setMessageUser(null)} />;
            case 'matches': 
                return <Matches onMessage={handleOpenMessage} />;
            case 'notifications': 
                return <Notifications />;
            case 'visuals': 
                return <Visuals dreams={dreams} onRefresh={fetchDreams} initialDreamId={initialVisualId} />;
            case 'profile': 
                return <Profile user={user} onViewVisual={(id) => {
                    setInitialVisualId(id);
                    setActiveTab('visuals');
                }} onSettings={() => setActiveTab('settings')} />;
            case 'settings':
                return <Settings onBack={() => setActiveTab('profile')} />;
            default: 
                return <Feed dreams={dreams} loading={loading} onRefresh={fetchDreams} onViewVisual={(id) => {
                    setInitialVisualId(id);
                    setActiveTab('visuals');
                }} />;
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveTab('feed')}>
                        <img src="/logo-mark.svg" style={{ width: '28px', height: '28px', display: 'block' }} alt="DreamMatch Logo" />
                        <span style={{ 
                            fontWeight: 800, 
                            fontSize: '20px', 
                            letterSpacing: '-0.03em',
                            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
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
                                color: 'var(--text-primary)',
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
                                color: 'var(--text-primary)',
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
            {!isMobile && activeTab !== 'settings' && activeTab !== 'messages' && (
                <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <GlassCard style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-xl)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Your Streak</h3>
                            <div style={{ background: 'rgba(99, 102, 241, 0.12)', padding: '8px', borderRadius: '10px' }}>
                                <Flame color="var(--primary)" fill="var(--primary)" size={18} />
                            </div>
                        </div>
                        <div style={{ fontSize: '50px', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', letterSpacing: '-2px', textShadow: '0 8px 24px var(--primary-glow)' }}>
                            {user?.streakCount || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Days Active</div>
                    </GlassCard>

                    <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
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
                                        <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' }} className="hover-bg-simple"
                                            onClick={() => handleOpenMessage(otherUser)}
                                        >
                                            <img src={otherUser.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{otherUser.username}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>{Math.round(match.score * 100)}% Match</div>
                                            </div>
                                            <Zap size={14} color="var(--primary)" fill="var(--primary)" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button onClick={() => setActiveTab('matches')} style={{ marginTop: 'auto', width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', padding: '12px' }} className="hover-scale">View All</button>
                    </GlassCard>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => setShowCreateModal(true)} />
            )}

            {/* Create Dream Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateDreamModal onClose={() => setShowCreateModal(false)} onPosted={fetchDreams} />
                )}
            </AnimatePresence>
        </div>
    );
};

const CreateDreamModal = ({ onClose, onPosted }) => {
    const [step, setStep] = useState(1);
    const [description, setDescription] = useState('');
    const [mood, setMood] = useState('peaceful');
    const [visibility, setVisibility] = useState('Everyone');
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

    const MOODS = [
        { id: 'happy', label: 'Happy', emoji: '😃' },
        { id: 'peaceful', label: 'Peaceful', emoji: '🧘' },
        { id: 'scary', label: 'Scary', emoji: '💀' },
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
                    // Auto-select the first loaded variation
                    if (!selectedImage && index === 0) {
                        setSelectedImage(data.image);
                    }
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
                body: JSON.stringify({ description: `${description} (${mood} mood)` })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.pending) {
                    setVariationsMeta(data.variations);
                    setVideoMeta(data.video);
                    setImages([null, null, null, null]);
                    setSelectedImage(null);
                    setLoadingStates([true, true, true, true]);
                    setFailedStates([false, false, false, false]);

                    // Sequentially fetch all 4 variations
                    for (let i = 0; i < data.variations.length; i++) {
                        await fetchVariation(i, data.variations[i], token);
                    }
                    await fetchVideo(data.video, token);
                } else {
                    setImages(data.images);
                    setSelectedImage(data.images[0]);
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

    const handleDownloadImage = () => {
        if (!selectedImage) return;
        const a = document.createElement('a');
        a.href = selectedImage;
        a.download = `dream-vision-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleShareImage = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Dream Vision - DreamMatch',
                text: description,
                url: selectedImage
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(selectedImage);
            alert('Link copied to clipboard!');
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
                    videoUrl: videoUrl,
                    theme: mood
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
                style={{ width: '100%', maxWidth: '580px', zIndex: 1001 }}
            >
                <GlassCard style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', borderRadius: 'var(--radius-2xl)' }} className="hide-scrollbar">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {step === 2 && (
                                <button 
                                    onClick={() => setStep(1)} 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', padding: '6px 12px', fontSize: '13px', borderRadius: '8px', boxShadow: 'none' }}
                                >
                                    ← Edit
                                </button>
                            )}
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                                {step === 1 ? 'Create Dream' : 'AI Generated'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {step === 1 && (
                                <button 
                                    onClick={() => alert('History tab coming soon!')}
                                    style={{ background: 'transparent', border: 'var(--glass-border)', color: 'var(--text-primary)', padding: '6px 12px', fontSize: '12px', borderRadius: '10px', boxShadow: 'none' }}
                                >
                                    History
                                </button>
                            )}
                            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', padding: '8px', borderRadius: '50%', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><X size={16} /></button>
                        </div>
                    </div>

                    {step === 1 ? (
                        /* Step 1: Write and Configure Dream */
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>What did you dream about?</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="I was flying over a futuristic city during sunset. The sky was glowing orange and everything felt so real."
                                    style={{
                                        width: '100%',
                                        height: '140px',
                                        padding: '16px',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        lineHeight: 1.5,
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

                            {/* Choose Mood section styled as chips */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Choose Mood</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {MOODS.map(m => {
                                        const isSelected = mood === m.id;
                                        return (
                                            <motion.div
                                                whileHover={{ y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                key={m.id}
                                                onClick={() => setMood(m.id)}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '100px',
                                                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                                    background: isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)',
                                                    color: isSelected ? 'white' : 'var(--text-secondary)',
                                                    fontWeight: isSelected ? 700 : 500,
                                                    fontSize: '13px'
                                                }}
                                            >
                                                <span>{m.emoji}</span>
                                                <span>{m.label}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Visibility selector */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Visibility</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            fontSize: '14px',
                                            height: '50px',
                                            outline: 'none',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            appearance: 'none',
                                            WebkitAppearance: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1px solid var(--primary)';
                                            e.target.style.boxShadow = 'var(--focus-ring)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="Everyone" style={{ background: '#0a0a0f', color: 'white' }}>Everyone</option>
                                        <option value="Friends" style={{ background: '#0a0a0f', color: 'white' }}>Friends</option>
                                        <option value="Private" style={{ background: '#0a0a0f', color: 'white' }}>Private</option>
                                    </select>
                                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }}>▼</div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleGenerate}
                                disabled={generating || !description}
                                style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', boxShadow: '0 8px 20px var(--primary-glow)' }}
                            >
                                {generating ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white' }} />
                                        <span>Subconscious visualizing...</span>
                                    </div>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Wand2 size={18} /> Generate Visual</span>
                                )}
                            </motion.button>
                        </div>
                    ) : (
                        /* Step 2: AI Generated Preview and Options */
                        <div>
                            {/* Status indicator */}
                            <div style={{ marginBottom: '14px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '10px' }}>
                                <span>Status:</span>
                                {images.filter(Boolean).length === 4 ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>Visions complete! Select one to share.</span>
                                ) : (
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                        Synthesizing dreams ({images.filter(Boolean).length}/4 loaded)...
                                    </span>
                                )}
                            </div>

                            {/* Large Image Preview with micro action buttons */}
                            <div style={{ 
                                position: 'relative', 
                                width: '100%', 
                                aspectRatio: '1.1/1', 
                                borderRadius: 'var(--radius-xl)', 
                                overflow: 'hidden', 
                                background: '#050508', 
                                border: '1px solid rgba(255,255,255,0.06)',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Active vision preview" />
                                        {/* Bottom Action Overlays */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: '16px', 
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'rgba(10, 10, 15, 0.75)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '8px 16px',
                                            borderRadius: '100px',
                                            display: 'flex',
                                            gap: '20px',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <button onClick={() => alert('Liked!')} style={{ background: 'transparent', border: 'none', padding: '4px', color: '#ff4757', display: 'flex', alignItems: 'center', boxShadow: 'none', transform: 'none' }} className="hover-scale"><Heart size={18} fill="#ff4757" /></button>
                                            <button onClick={handleDownloadImage} style={{ background: 'transparent', border: 'none', padding: '4px', color: 'white', display: 'flex', alignItems: 'center', boxShadow: 'none', transform: 'none' }} className="hover-scale"><Download size={18} /></button>
                                            <button onClick={handleShareImage} style={{ background: 'transparent', border: 'none', padding: '4px', color: 'white', display: 'flex', alignItems: 'center', boxShadow: 'none', transform: 'none' }} className="hover-scale"><Share2 size={18} /></button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div className="loading-spinner" />
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Synthesizing preview...</span>
                                    </div>
                                )}
                            </div>

                            {/* 4 Image Variations Selector Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                                {[0, 1, 2, 3].map((index) => {
                                    const img = images[index];
                                    const isLoading = loadingStates[index];
                                    const isFailed = failedStates[index];
                                    const isSelected = selectedImage === img && img;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => img && setSelectedImage(img)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                                cursor: img ? 'pointer' : 'default',
                                                border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                                background: 'rgba(255,255,255,0.01)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all var(--transition-fast)',
                                                boxShadow: isSelected ? '0 0 10px var(--primary-glow)' : 'none'
                                            }}
                                            className={isLoading ? "shimmer" : ""}
                                        >
                                            {isLoading ? (
                                                <div className="loading-spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderTopColor: 'var(--primary)' }} />
                                            ) : isFailed ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '4px' }}>
                                                    <span style={{ fontSize: '8px', color: 'var(--error)', fontWeight: 700 }}>Failed</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRetryVariation(index); }}
                                                        style={{ padding: '2px 6px', fontSize: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : img ? (
                                                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`var-${index}`} />
                                            ) : (
                                                <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Wait...</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions and Regenerate buttons */}
                            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                                {videoFailed && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', fontSize: '12px', color: '#ff7675' }}>
                                        <span>Video generation timed out.</span>
                                        <button onClick={handleRetryVideo} style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Retry Video</button>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={handlePost}
                                        disabled={!selectedImage || videoLoading}
                                        style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', boxShadow: '0 8px 20px var(--primary-glow)' }}
                                    >
                                        {videoLoading ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white' }} />
                                                <span>Synthesizing Reel...</span>
                                            </div>
                                        ) : (
                                            <span>Post Dream</span>
                                        )}
                                    </motion.button>
                                    
                                    <button 
                                        onClick={() => setStep(1)} 
                                        style={{ 
                                            background: 'transparent', 
                                            color: 'var(--text-muted)', 
                                            fontSize: '13px', 
                                            fontWeight: 600, 
                                            padding: '8px', 
                                            border: 'none',
                                            boxShadow: 'none',
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                                    >
                                        Regenerate
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
