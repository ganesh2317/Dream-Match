import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import { Home, MessageCircle, PlusSquare, Bell, Settings, Flame, Send, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMockMatches } from '../utils/mockData';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('feed');
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Poll for dreams (simulate real-time)
    const fetchDreams = () => {
        // Read from global storage
        const storedDreams = JSON.parse(localStorage.getItem('dreams') || '[]');
        setDreams(storedDreams.reverse());
        setLoading(false);
    };

    useEffect(() => {
        fetchDreams();
        // Refresh feed every 5 seconds to see other users' posts
        const interval = setInterval(fetchDreams, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '24px', gap: '24px' }}>

            {/* Left Sidebar */}
            <GlassCard className="sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '40px', paddingLeft: '12px' }}>DreamSocial</h1>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <NavItem icon={Home} label="Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                    <NavItem icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                    <NavItem icon={PlusSquare} label="Post Dream" onClick={() => setShowCreateModal(true)} />
                    <NavItem icon={Bell} label="Notifications" />
                    <NavItem icon={Settings} label="Logout" onClick={logout} />
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                    <img src={user?.avatarUrl} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{user?.fullName || 'User'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>@{user?.username || 'user'}</div>
                    </div>
                </div>
            </GlassCard>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>

                {activeTab === 'feed' ? (
                    <>
                        <h2 style={{ marginBottom: '24px' }}>Timeline</h2>

                        {loading ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
                                Loading dreams...
                            </div>
                        ) : dreams.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                                No dreams logged yet.<br />Tap <b>Post Dream</b> to start your streak!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                                {dreams.map((dream) => (
                                    <GlassCard key={dream.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <img src={dream.userAvatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{dream.username}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{new Date(dream.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            {/* Show streak badge if user has one */}
                                            {dream.userStreak > 0 && (
                                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'orange', background: 'rgba(255, 165, 0, 0.1)', padding: '4px 8px', borderRadius: '100px' }}>
                                                    <Flame size={12} fill="orange" /> {dream.userStreak}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ height: '400px', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', background: '#f0f0f0' }}>
                                            <img src={dream.imageUrl} alt="dream" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: '1.4' }}>{dream.description}</h3>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <MessagesTab currentUser={user} />
                )}
            </div>

            {/* Right Sidebar (Stats/Streaks) */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <GlassCard>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3>Streaks</h3>
                        <Flame color="orange" fill="orange" />
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 700, textAlign: 'center' }}>
                        {user?.streakCount || 0}
                    </div>
                    <div style={{ textAlign: 'center', color: '#666' }}>Days Streak</div>
                </GlassCard>

                <GlassCard>
                    <h3>Suggested Matches</h3>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getMockMatches().map(match => (
                            <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg">
                                <img src={match.avatarUrl} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                <div>{match.username}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Create Dream Modal */}
            {showCreateModal && (
                <CreateDreamModal user={user} onClose={() => setShowCreateModal(false)} onPosted={fetchDreams} />
            )}

        </div>
    );
};

// --- Sub-components ---

const MessagesTab = ({ currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Load messages
        const load = () => {
            const msgs = JSON.parse(localStorage.getItem('global_chat') || '[]');
            setMessages(msgs);
        }
        load();
        const interval = setInterval(load, 2000); // Poll for new messages
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        const newMsg = {
            id: Date.now(),
            text: input,
            sender: currentUser.username,
            avatar: currentUser.avatarUrl,
            timestamp: new Date()
        };
        const updated = [...messages, newMsg];
        localStorage.setItem('global_chat', JSON.stringify(updated));
        setMessages(updated);
        setInput('');
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '16px' }}>Global Dreamers Chat</h2>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No messages yet. Say hi!</div>}
                {messages.map(msg => {
                    const isMe = msg.sender === currentUser.username;
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                            <img src={msg.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                            <div style={{
                                background: isMe ? 'var(--ios-blue)' : 'white',
                                color: isMe ? 'white' : 'black',
                                padding: '10px 16px',
                                borderRadius: '18px',
                                borderBottomRightRadius: isMe ? '4px' : '18px',
                                borderBottomLeftRadius: isMe ? '18px' : '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                maxWidth: '70%'
                            }}>
                                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '2px' }}>{msg.sender}</div>
                                {msg.text}
                            </div>
                        </div>
                    )
                })}
                <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', marginTop: '16px' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Type a message..."
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px' }}
                />
                <button onClick={send} style={{ background: 'var(--ios-blue)', color: 'white', padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}

const CreateDreamModal = ({ user, onClose, onPosted }) => {
    const [step, setStep] = useState(1);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!description) return;
        setGenerating(true);
        // Using Pollinations.ai for REAL generation without API key
        // We generate 4 variants by appending random seeds to the prompt
        const prompt = encodeURIComponent(description);

        // Generate 4 "different" image URLs (the browser will fetch them)
        // Note: We use a timestamp to bypass cache for fresh generation
        const variants = [
            `https://image.pollinations.ai/prompt/${prompt}?seed=${Math.floor(Math.random() * 1000)}&n=1`,
            `https://image.pollinations.ai/prompt/${prompt}?seed=${Math.floor(Math.random() * 1000)}&n=2`,
            `https://image.pollinations.ai/prompt/${prompt}?seed=${Math.floor(Math.random() * 1000)}&n=3`,
            `https://image.pollinations.ai/prompt/${prompt}?seed=${Math.floor(Math.random() * 1000)}&n=4`,
        ];

        // Simulate a short wait for UX, though the images load lazily
        await new Promise(r => setTimeout(r, 2000));

        setImages(variants);
        setGenerating(false);
        setStep(2);
    };

    const handlePost = async () => {
        if (!selectedImage) return;

        const newDream = {
            id: Date.now().toString(),
            description,
            imageUrl: selectedImage,
            createdAt: new Date(),
            userId: user.id,
            username: user.username,
            userAvatar: user.avatarUrl,
            userStreak: user.streakCount + 1 // Preview the increment
        };

        const currentDreams = JSON.parse(localStorage.getItem('dreams') || '[]');
        currentDreams.push(newDream);
        localStorage.setItem('dreams', JSON.stringify(currentDreams));

        // Update user streak logic: 
        // Simple increment for demo. In real app, check dates.
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserIdx = users.findIndex(u => u.username === user.username);

        let newStreak = (user.streakCount || 0) + 1;

        if (currentUserIdx !== -1) {
            users[currentUserIdx].streakCount = newStreak;
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Update session
        const session = { ...user, streakCount: newStreak };
        localStorage.setItem('currentUser', JSON.stringify(session));

        onPosted();
        window.location.reload(); // Force refresh to show new streak
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', zIndex: 100 }}>
            <GlassCard style={{ width: '600px', background: 'var(--ios-gray-light)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3>{step === 1 ? 'Visualize your dream' : 'Select the best match'}</h3>
                    <X style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                {step === 1 ? (
                    <>
                        <h4 style={{ marginBottom: '8px', color: '#666', fontWeight: 400 }}>Describe what you saw... (be specific)</h4>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A futuristic city made of crystal floating in the clouds during sunset..."
                            style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: 'none', marginBottom: '24px', fontSize: '16px', fontFamily: 'inherit', resize: 'none' }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            style={{ width: '100%', padding: '16px', background: 'var(--ios-blue)', color: 'white', borderRadius: '12px', opacity: generating ? 0.7 : 1, transition: '0.2s', fontWeight: 600 }}
                        >
                            {generating ? 'Dreaming (AI Generating)...' : 'Generate Visuals'}
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            {images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                                    <img
                                        src={img}
                                        onClick={() => setSelectedImage(img)}
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer',
                                            border: selectedImage === img ? '4px solid var(--ios-blue)' : 'none',
                                            transform: selectedImage === img ? 'scale(0.98)' : 'scale(1)',
                                            transition: '0.2s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: '#e5e5ea', borderRadius: '12px', fontWeight: 600 }}>Back</button>
                            <button onClick={handlePost} style={{ flex: 1, padding: '14px', background: 'var(--ios-blue)', color: 'white', borderRadius: '12px', fontWeight: 600 }}>Post Dream</button>
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    )
}

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '12px',
        cursor: 'pointer',
        background: active ? 'rgba(255,255,255,0.5)' : 'transparent',
        fontWeight: active ? 600 : 400,
        color: active ? 'black' : '#666',
        transition: 'background 0.2s'
    }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.background = active ? 'rgba(255,255,255,0.5)' : 'transparent'}
    >
        <Icon size={20} />
        {label}
    </div>
)

export default Dashboard;
