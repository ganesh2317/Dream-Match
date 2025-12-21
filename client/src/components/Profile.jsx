import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { User as UserIcon, Edit2, Save, X, Camera, Flame, Image as ImageIcon, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = ({ user: propUser }) => {
    const { user: contextUser } = useAuth();
    const user = propUser || contextUser;

    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
            setPreview(user.avatarUrl || '');
        }
    }, [user]);

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

    const userDreams = user.dreams || [];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            {/* Profile Header Card */}
            <GlassCard style={{ padding: '0', overflow: 'hidden', marginBottom: '40px' }}>
                {/* Banner Background */}
                <div style={{
                    height: '180px',
                    background: 'var(--primary-gradient)',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
                </div>

                <div style={{ padding: '0 40px 40px 40px', marginTop: '-60px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={preview}
                                alt="Profile"
                                style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '30px',
                                    border: '6px solid var(--bg-dark)',
                                    objectFit: 'cover',
                                    backgroundColor: '#1a1a1a',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}
                            />
                            {isEditing && (
                                <label style={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    right: '-10px',
                                    background: 'var(--primary)',
                                    borderRadius: '12px',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '4px solid var(--bg-dark)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}>
                                    <Camera size={20} color="white" />
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        {user.id !== contextUser?.id ? (
                            <button
                                onClick={() => {/* Toggle Follow logic here */ }}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    background: user.isFollowing ? 'rgba(255,255,255,0.08)' : 'var(--primary)',
                                    border: user.isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}
                            >
                                {user.isFollowing ? 'Following' : 'Follow Soul'}
                            </button>
                        ) : !isEditing ? (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px' }}>
                                    <X size={18} />
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: '12px' }}>
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-1px' }}>{user.fullName}</h2>
                            <div style={{ color: 'var(--primary)', marginBottom: '20px', fontWeight: 700, fontSize: '18px' }}>@{user.username}</div>

                            {isEditing ? (
                                <div style={{ maxWidth: '500px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        About Me ({bio.length}/100)
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value.slice(0, 100))}
                                        placeholder="Tell us about your dreams..."
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '16px',
                                            color: 'white',
                                            fontSize: '16px',
                                            minHeight: '100px',
                                            resize: 'none',
                                            fontFamily: 'inherit',
                                            transition: 'border 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                            ) : (
                                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '600px' }}>
                                    {user.bio || <span style={{ fontStyle: 'italic', opacity: 0.3 }}>No bio added yet.</span>}
                                </p>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <StatBox icon={Flame} value={user.streakCount || 0} label="Streak" color="#ff9f43" />
                            <StatBox icon={Users} value={user._count?.followers || 0} label="Followers" color="var(--accent)" />
                            <StatBox icon={Users} value={user._count?.following || 0} label="Following" color="var(--success)" />
                            <StatBox icon={ImageIcon} value={userDreams.length} label="Dreams" color="var(--primary)" />
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={24} color="var(--primary)" /> Dream Gallery
                </h3>
            </div>

            {userDreams.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {userDreams.map((dream, index) => (
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
                    <p>Your dream gallery is empty.</p>
                </GlassCard>
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
