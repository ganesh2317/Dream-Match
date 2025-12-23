import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { User as UserIcon, Edit2, Save, X, Camera, Flame, Image as ImageIcon, Sparkles, Users, MessageCircle, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = ({ user: propUser, onBack, onMessage, onViewVisual }) => {
    const { user: contextUser } = useAuth();
    const [user, setUser] = useState(propUser || contextUser);
    const [userDreams, setUserDreams] = useState([]);
    const [galleryTab, setGalleryTab] = useState('dreams'); // 'dreams' or 'visuals'

    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (propUser && propUser.id !== contextUser?.id) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/api/users/profile/${propUser.username}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                        setUserDreams(data.dreams || []);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else if (contextUser) {
                // Fetch current user's own profile
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/api/users/profile/${contextUser.username}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                        setUserDreams(data.dreams || []);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchUserProfile();
    }, [propUser?.id, contextUser?.username]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bio, avatarUrl: preview })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    if (!user) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    const dreamsOnly = userDreams;
    const visualsOnly = userDreams.filter(d => d.videoUrl);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '10px 20px',
                        marginBottom: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Back to Search
                </button>
            )}

            <GlassCard style={{ padding: '40px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={preview || user.avatarUrl}
                            style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '28px',
                                objectFit: 'cover',
                                border: '4px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                            }}
                        />
                        {!propUser && (
                            <label style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                background: 'var(--primary)',
                                width: '38px',
                                height: '38px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
                                transition: '0.2s'
                            }}
                                className="hover-scale"
                            >
                                <Camera size={18} color="white" />
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>{user.fullName}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>@{user.username}</span>
                                </div>
                            </div>

                            {!propUser ? (
                                !isEditing ? (
                                    <button onClick={() => { setIsEditing(true); setBio(user.bio || ''); }} style={{ padding: '10px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setPreview(''); }} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                )
                            ) : (
                                <button onClick={() => onMessage(user)} style={{ padding: '10px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageCircle size={16} /> Message
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                placeholder="Write a short bio (max 100 characters)"
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '14px',
                                    resize: 'none',
                                    marginBottom: '12px'
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', fontSize: '15px' }}>
                                {user.bio || 'No bio yet.'}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <StatBox icon={ImageIcon} value={userDreams.length} label="Dreams" color="var(--primary)" />
                            <StatBox icon={Video} value={visualsOnly.length} label="Visuals" color="var(--accent)" />
                            <StatBox icon={Users} value={user._count?.followers || 0} label="Followers" color="var(--success)" />
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setGalleryTab('dreams')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '14px',
                            background: galleryTab === 'dreams' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: galleryTab === 'dreams' ? 'white' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: '0.2s'
                        }}
                    >
                        <ImageIcon size={18} /> Dreams ({dreamsOnly.length})
                    </button>
                    <button
                        onClick={() => setGalleryTab('visuals')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '14px',
                            background: galleryTab === 'visuals' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: galleryTab === 'visuals' ? 'white' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: '0.2s'
                        }}
                    >
                        <Video size={18} /> Visuals ({visualsOnly.length})
                    </button>
                </div>

                <h3 style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {galleryTab === 'dreams' ? <ImageIcon size={24} /> : <Video size={24} />}
                    {galleryTab === 'dreams' ? 'Dream Gallery' : 'Visuals Gallery'}
                </h3>
            </div>

            {galleryTab === 'dreams' ? (
                dreamsOnly.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {dreamsOnly.map((dream) => (
                            <div
                                key={dream.id}
                                style={{
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    aspectRatio: '1',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                className="dream-thumb"
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)';
                                    e.currentTarget.querySelector('.overlay').style.opacity = '1';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    e.currentTarget.querySelector('.overlay').style.opacity = '0';
                                }}
                            >
                                <img
                                    src={dream.imageUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className="overlay" style={{
                                    position: 'absolute', inset: 0,
                                    padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                    opacity: 0, transition: '0.3s'
                                }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {new Date(dream.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {dream.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <GlassCard style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                        <ImageIcon size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
                        <p>No dreams yet.</p>
                    </GlassCard>
                )
            ) : (
                visualsOnly.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {visualsOnly.map((dream) => (
                            <div
                                key={dream.id}
                                onClick={() => onViewVisual && onViewVisual(dream.id)}
                                style={{
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    aspectRatio: '9/16',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                className="dream-thumb"
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)';
                                    e.currentTarget.querySelector('.overlay').style.opacity = '1';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    e.currentTarget.querySelector('.overlay').style.opacity = '0';
                                }}
                            >
                                <img
                                    src={dream.videoUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '8px 12px',
                                    borderRadius: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700
                                }}>
                                    <Sparkles size={14} fill="white" /> Visual
                                </div>
                                <div className="overlay" style={{
                                    position: 'absolute', inset: 0,
                                    padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                    opacity: 0, transition: '0.3s'
                                }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {new Date(dream.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {dream.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <GlassCard style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                        <Video size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
                        <p>No visuals yet.</p>
                    </GlassCard>
                )
            )}
        </div>
    );
};

const StatBox = ({ icon: Icon, value, label, color }) => (
    <div style={{ textAlign: 'center', padding: '16px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', minWidth: '100px' }}>
        <Icon size={20} color={color} style={{ marginBottom: '8px' }} />
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{value}</div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
);

export default Profile;
