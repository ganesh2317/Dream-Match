import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import Notifications from '../components/Notifications';
import Messages from '../components/Messages';
import Profile from '../components/Profile';
import { Flame, X } from 'lucide-react';
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

    // Render Content based on Tab
    const renderContent = () => {
        switch (activeTab) {
            case 'feed': return <Feed dreams={dreams} loading={loading} />;
            case 'messages': return <Messages currentUser={user} />;
            case 'notifications': return <Notifications />;
            case 'profile': return <Profile />;
            default: return <Feed dreams={dreams} loading={loading} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '24px', gap: '24px' }}>

            {/* Left Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setShowCreateModal={setShowCreateModal}
                user={user}
                logout={logout}
            />

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
                {renderContent()}
            </div>

            {/* Right Sidebar (Stats/Streaks) */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <GlassCard>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3>Streaks</h3>
                        <Flame color="#ffa502" fill="#ffa502" />
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 700, textAlign: 'center', color: '#ffa502', textShadow: '0 0 20px rgba(255, 165, 0, 0.4)' }}>
                        {user?.streakCount || 0}
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Days Streak</div>
                </GlassCard>

                <GlassCard>
                    <h3>Suggested Matches</h3>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getMockMatches().map(match => (
                            <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', background: 'rgba(255,255,255,0.08)' }} className="hover-bg">
                                <img src={match.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{match.username}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dream Match: 95%</div>
                                </div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 100 }}>
            <GlassCard style={{ width: '600px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3>{step === 1 ? 'Visualize your dream' : 'Select the best match'}</h3>
                    <X style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                {step === 1 ? (
                    <>
                        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>Describe what you saw... (be specific)</h4>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A futuristic city made of crystal floating in the clouds during sunset..."
                            style={{
                                width: '100%',
                                height: '140px',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                marginBottom: '24px',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                resize: 'none'
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            style={{ width: '100%', padding: '16px', opacity: generating ? 0.7 : 1, transition: '0.2s', fontWeight: 600 }}
                        >
                            {generating ? 'Dreaming (AI Generating)...' : 'Generate Visuals'}
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            {images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                                    <img
                                        src={img}
                                        onClick={() => setSelectedImage(img)}
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer',
                                            border: selectedImage === img ? '4px solid var(--primary)' : '2px solid transparent',
                                            transform: selectedImage === img ? 'scale(0.98)' : 'scale(1)',
                                            transition: '0.2s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 600 }}>Back</button>
                            <button onClick={handlePost} style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: 600 }}>Post Dream</button>
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    )
}

export default Dashboard;
