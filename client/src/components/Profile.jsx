import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { User as UserIcon, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = ({ user: propUser }) => {
    const { user: contextUser } = useAuth();
    // Use prop user if viewing others (future proof), else context user
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
            const res = await fetch('http://localhost:3000/api/auth/profile', {
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

    if (!user) return <div style={{ color: 'white' }}>Loading Profile...</div>;

    const userDreams = user.dreams || [];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <GlassCard style={{ position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
                {/* Header Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '140px',
                    background: 'var(--primary-gradient)',
                    opacity: 0.8
                }} />

                <div style={{ position: 'relative', marginTop: '70px', padding: '0 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={preview}
                                alt="Profile"
                                style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '50%',
                                    border: '4px solid var(--bg-dark)',
                                    objectFit: 'cover',
                                    backgroundColor: '#2a2a2a'
                                }}
                            />
                            {isEditing && (
                                <label style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '2px solid var(--bg-dark)'
                                }}>
                                    <Camera size={16} color="white" />
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', fontSize: '14px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                                <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <X size={16} />
                                </button>
                                <button onClick={handleSave} disabled={saving}>
                                    <Save size={16} style={{ marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '4px' }}>{user.fullName}</h2>
                        <div style={{ color: 'var(--accent)', marginBottom: '16px', fontWeight: 600 }}>@{user.username}</div>

                        {isEditing ? (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Bio ({bio.length}/100)
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value.slice(0, 100))}
                                    placeholder="Tell us about yourself..."
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '16px',
                                        minHeight: '100px',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        ) : (
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px' }}>
                                {user.bio || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No bio yet.</span>}
                            </p>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '48px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffa502' }}>{user.streakCount || 0}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Day Streak</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{userDreams.length}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dreams Logged</div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <h3 style={{ margin: '32px 0 16px 0', fontSize: '24px' }}>Dream History</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {userDreams.length > 0 ? userDreams.map(dream => (
                    <div key={dream.id} style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                            src={dream.imageUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {dream.description}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {new Date(dream.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No dreams recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
