import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { User as UserIcon, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, loading } = useAuth(); // We will need to implement updateProfile in AuthContext later or handle it here
    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [description, setDescription] = useState(user?.description || '');
    const [saving, setSaving] = useState(false);

    // Initialize state when user loads
    React.useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setDescription(user.description || '');
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update local storage directly for now (mimicking AuthContext update)
            // In a real app calling a function from useAuth() is better, but we need to implement it first.
            // Let's implement the logic here to be fast.

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUserIdx = users.findIndex(u => u.username === user.username);

            const updates = { fullName, description };

            if (currentUserIdx !== -1) {
                users[currentUserIdx] = { ...users[currentUserIdx], ...updates };
                localStorage.setItem('users', JSON.stringify(users));
            }

            // Update session
            const newSession = { ...user, ...updates };
            localStorage.setItem('currentUser', JSON.stringify(newSession));

            // Force reload to reflect changes globally for now
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    if (loading || !user) return <div>Loading Profile...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <GlassCard style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Header Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    background: 'var(--primary-gradient)',
                    opacity: 0.8
                }} />

                <div style={{ position: 'relative', marginTop: '60px', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <img
                            src={user.avatarUrl}
                            alt="Profile"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid var(--bg-dark)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        />
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
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Display Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bio / Description</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '16px',
                                            minHeight: '100px',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>{user.fullName}</h2>
                                <div style={{ color: 'var(--accent)', marginBottom: '16px' }}>@{user.username}</div>

                                {user.description ? (
                                    <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '16px' }}>
                                        {user.description}
                                    </p>
                                ) : (
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description yet.</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '32px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{user.streakCount || 0}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Day Streak</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>0</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dreams Logged</div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Profile;
