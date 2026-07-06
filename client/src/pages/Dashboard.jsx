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
import { Moon, X, Sparkles, Wand2, Zap, Flame, PlusSquare, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('feed');
    const [initialVisualId, setInitialVisualId] = useState(null);
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [messageUser, setMessageUser] = useState(null);
    const [dbMatches, setDbMatches] = useState([]);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
            background: 'var(--bg-gradient)',
            padding: isMobile ? '0' : '20px',
            gap: isMobile ? '0' : '20px',
            overflow: 'hidden'
        }}>
            {/* Mobile Header */}
            {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: 'var(--glass-border)', zIndex: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            style={{ background: 'transparent', padding: 0, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transform: 'none', boxShadow: 'none' }}
                        >
                            <img src={user?.avatarUrl} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>DreamMatch</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ff9f43', background: 'rgba(255, 159, 67, 0.1)', padding: '4px 10px', borderRadius: '100px', fontWeight: 700 }}>
                            <Flame size={14} fill="#ff9f43" /> {user?.streakCount || 0}
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ background: 'var(--primary-gradient)', padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
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
                    logout={logout}
                />
            )}

            {/* Mobile Slide Drawer Sidebar */}
            {isMobile && showMobileSidebar && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
                    <div
                        onClick={() => setShowMobileSidebar(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s' }}
                    />
                    <div style={{ position: 'relative', width: '280px', height: '100%', animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setShowMobileSidebar(false);
                            }}
                            setShowCreateModal={(show) => {
                                setShowCreateModal(show);
                                setShowMobileSidebar(false);
                            }}
                            user={user}
                            logout={logout}
                        />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 10px' : '0 10px', scrollBehavior: 'smooth' }}>
                {renderContent()}
            </div>

            {/* Right Sidebar (Desktop only) */}
            {!isMobile && (
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <GlassCard style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px' }}>Your Dream Streak</h3>
                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '12px' }}>
                                <Moon color="var(--primary)" fill="var(--primary)" size={20} />
                            </div>
                        </div>
                        <div style={{ fontSize: '56px', fontWeight: 800, textAlign: 'center', color: 'var(--primary)', letterSpacing: '-2px', textShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}>
                            {user?.streakCount || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Days Active</div>
                    </GlassCard>

                    <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={18} color="var(--primary)" /> Potential Matches
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {dbMatches.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No matches found yet. Share more dreams to connect!
                                </div>
                            ) : (
                                dbMatches.map(match => {
                                    const otherUser = match.senderId === user.id ? match.receiver : match.sender;
                                    return (
                                        <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' }} className="hover-bg"
                                            onClick={() => handleOpenMessage(otherUser)}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <img src={otherUser.avatarUrl} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser.username}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>{Math.round(match.score * 100)}% Match</div>
                                            </div>
                                            <Zap size={14} color="var(--primary)" fill="var(--primary)" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button onClick={() => setActiveTab('matches')} style={{ marginTop: 'auto', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>View All</button>
                    </GlassCard>
                </div>
            )}

            {showCreateModal && (
                <CreateDreamModal user={user} onClose={() => setShowCreateModal(false)} onPosted={fetchDreams} />
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
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

    const STYLES = [
        { id: 'surreal', label: 'Surrealism', emoji: '🌌' },
        { id: 'ethereal', label: 'Ethereal', emoji: '✨' },
        { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆' },
        { id: 'oil', label: 'Oil Painting', emoji: '🎨' },
    ];

    const handleGenerate = async () => {
        if (!description) return;
        setGenerating(true);

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
                setImages(data.images);
                setVideoUrl(data.videoUrl);
                setStep(2);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setGenerating(false);
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)', zIndex: 1000, padding: '20px' }} className="fade-in">
            <GlassCard style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{step === 1 ? 'Visualize Your Dream' : 'Choose Your Vision'}</h2>
                    <div onClick={onClose} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><X size={20} /></div>
                </div>

                {step === 1 ? (
                    <div className="fade-in">
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Describe what you saw</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A crystal castle floating above a sea of neon clouds..."
                                style={{
                                    width: '100%',
                                    height: '160px',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: 'white',
                                    fontSize: '17px',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Dream Style</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {STYLES.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        style={{
                                            padding: '16px 8px',
                                            borderRadius: '16px',
                                            border: style === s.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                            background: style === s.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: '0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.emoji}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !description}
                            style={{ width: '100%', padding: '18px', fontSize: '16px', borderRadius: '16px' }}
                        >
                            {generating ? 'Tapping into the subconscious...' : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wand2 size={20} /> Generate Visions</span>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedImage === img ? '4px solid var(--primary)' : '2px solid transparent',
                                        transition: '0.2s',
                                        transform: selectedImage === img ? 'scale(0.96)' : 'scale(1)'
                                    }}
                                >
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {selectedImage === img && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', borderRadius: '50%', padding: '4px' }}>
                                            <Zap size={16} color="white" fill="white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>Try Different Prompt</button>
                            <button onClick={handlePost} disabled={!selectedImage} style={{ flex: 1, padding: '16px' }}>Share with the World</button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    )
}

export default Dashboard;
