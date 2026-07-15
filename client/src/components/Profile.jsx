import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { 
    User as UserIcon, 
    Edit2, 
    Save, 
    X, 
    Camera, 
    Flame, 
    Image as ImageIcon, 
    Sparkles, 
    Users, 
    MessageCircle, 
    Video, 
    ArrowLeft,
    Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserListModal = ({ title, endpoint, onClose, onViewProfile }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [endpoint]);

    const handleFollowToggle = async (e, user, index) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const url = user.isFollowing ? `/api/users/unfollow/${user.id}` : `/api/users/follow/${user.id}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(prev => {
                    const next = [...prev];
                    next[index] = { ...user, isFollowing: !user.isFollowing };
                    return next;
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <GlassCard style={{
                width: '100%', maxWidth: '420px', padding: '24px',
                borderRadius: 'var(--radius-xl)', border: 'var(--glass-border)',
                background: 'rgba(15, 15, 25, 0.75)', position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Close</button>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading...</div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No users found</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '300px', overflowY: 'auto' }} className="hide-scrollbar">
                        {users.map((u, i) => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { onViewProfile(u); onClose(); }}>
                                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{u.fullName || u.username}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

const Profile = ({ user: propUser, onBack, onMessage, onViewVisual, onSettings, onViewProfile }) => {
    const { user: contextUser, updateUser } = useAuth();
    const [user, setUser] = useState(propUser || contextUser);
    const [userDreams, setUserDreams] = useState([]);
    const [galleryTab, setGalleryTab] = useState('dreams'); // 'dreams' or 'visuals'
    const [userListModalConfig, setUserListModalConfig] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);
    
    const [isFollowingState, setIsFollowingState] = useState(false);

    useEffect(() => {
        if (user) {
            setIsFollowingState(user.isFollowing || false);
        }
    }, [user?.isFollowing]);

    const handleFollowToggle = async () => {
        const endpoint = isFollowingState ? 'unfollow' : 'follow';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${endpoint}/${user.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setIsFollowingState(!isFollowingState);
                setUser(prev => {
                    const countOffset = isFollowingState ? -1 : 1;
                    return {
                        ...prev,
                        _count: {
                            ...prev._count,
                            followers: Math.max(0, (prev._count?.followers || 0) + countOffset)
                        }
                    };
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                const data = await res.json();
                updateUser({ bio: data.bio, avatarUrl: data.avatarUrl });
                setUser(prev => ({ ...prev, bio: data.bio, avatarUrl: data.avatarUrl }));
                setPreview('');
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
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }} className="fade-in">
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        background: 'var(--glass-bg)',
                        border: 'var(--glass-border)',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        marginBottom: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        boxShadow: 'none',
                        transform: 'none',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Search
                </button>
            )}

            <GlassCard style={{ padding: '0', marginBottom: '32px', overflow: 'hidden', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                {/* Banner */}
                <div style={{
                    height: '160px',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(14, 165, 233, 0.2) 100%)',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                    }} />
                </div>

                <div style={{ padding: '0 32px 32px 32px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginTop: '-60px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', zIndex: 5 }}>
                            <div style={{
                                padding: '4px',
                                background: '#0a0a0f',
                                borderRadius: '32px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                            }}>
                                <img
                                    src={preview || user.avatarUrl}
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        borderRadius: '28px',
                                        objectFit: 'cover',
                                        border: '2px solid var(--primary)'
                                    }}
                                    alt="profile-avatar"
                                />
                            </div>
                            {!propUser && (
                                <label style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    background: 'var(--primary)',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px var(--primary-glow)',
                                    transition: '0.2s',
                                    border: '2px solid #0a0a0f'
                                }}
                                    className="hover-scale"
                                >
                                    <Camera size={14} color="white" />
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: '240px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{user.fullName}</h2>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>@{user.username}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {!propUser ? (
                                    !isEditing ? (
                                        <>
                                            <button onClick={() => { setIsEditing(true); setBio(user.bio || ''); }} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Edit2 size={14} /> Edit Profile
                                            </button>
                                            {onSettings && (
                                                <button 
                                                    onClick={onSettings}
                                                    style={{ 
                                                        padding: '8px', 
                                                        borderRadius: '10px', 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        color: 'var(--text-primary)',
                                                        boxShadow: 'none', 
                                                        transform: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <SettingsIcon size={16} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button onClick={() => { setIsEditing(false); setPreview(''); }} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-primary)', boxShadow: 'none', transform: 'none' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollowToggle}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '10px',
                                                fontSize: '13px',
                                                background: isFollowingState ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                                                border: isFollowingState ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                color: 'white',
                                                boxShadow: isFollowingState ? 'none' : '0 4px 12px var(--primary-glow)'
                                            }}
                                        >
                                            {isFollowingState ? 'Following' : 'Follow'}
                                        </button>
                                        <button onClick={() => onMessage(user)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none', transform: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MessageCircle size={14} /> Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        {/* Compatibility Card (for other users) */}
                        {propUser && propUser.id !== contextUser?.id && (
                            <div style={{
                                padding: '16px 20px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                borderRadius: '16px',
                                marginBottom: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyComposite: 'space-between', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        <Sparkles size={16} color="var(--primary)" /> Compatibility Score
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--success)' }}>
                                        {user.compatibilityScore !== undefined ? Math.round(user.compatibilityScore * 100) : 0}%
                                    </div>
                                </div>
                                
                                {user.mutualInterests && user.mutualInterests.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>Mutual Dream Interests</div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {user.mutualInterests.map((interest, idx) => (
                                                <span key={idx} style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#c084fc', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px' }}>
                                                    #{interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.recentActivity && (
                                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
                                        {user.recentActivity}
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditing ? (
                            <textarea
                                placeholder="Tell the dreamscape about yourself (max 100 characters)..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    minHeight: '70px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '13px',
                                    resize: 'none',
                                    outline: 'none',
                                    transition: 'border var(--transition-fast)'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '14.5px', maxWidth: '600px' }}>
                                {user.bio || 'This wanderer has yet to record their path in the dreamscape.'}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatBox icon={ImageIcon} value={userDreams.length} label="Dreams" color="var(--primary)" />
                        <StatBox icon={Video} value={visualsOnly.length} label="Visuals" color="var(--accent)" />
                        <StatBox icon={Users} value={user._count?.followers || 0} label="Followers" color="var(--success)" onClick={() => setUserListModalConfig({ title: 'Followers', endpoint: `/api/users/${user.id}/followers` })} />
                        <StatBox icon={Users} value={user._count?.following || 0} label="Following" color="var(--primary)" onClick={() => setUserListModalConfig({ title: 'Following', endpoint: `/api/users/${user.id}/following` })} />
                    </div>
                </div>
            </GlassCard>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setGalleryTab('dreams')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            background: galleryTab === 'dreams' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: galleryTab === 'dreams' ? 'white' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: galleryTab === 'dreams' ? '0 4px 10px var(--primary-glow)' : 'none',
                            transform: 'none'
                        }}
                    >
                        <ImageIcon size={16} /> Dreams ({dreamsOnly.length})
                    </button>
                    <button
                        onClick={() => setGalleryTab('visuals')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            background: galleryTab === 'visuals' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: galleryTab === 'visuals' ? 'white' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: galleryTab === 'visuals' ? '0 4px 10px var(--primary-glow)' : 'none',
                            transform: 'none'
                        }}
                    >
                        <Video size={16} /> Visuals ({visualsOnly.length})
                    </button>
                </div>
            </div>

            {galleryTab === 'dreams' ? (
                dreamsOnly.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {dreamsOnly.map((dream) => (
                            <motion.div
                                whileHover={{ y: -4 }}
                                key={dream.id}
                                onClick={() => onViewVisual && onViewVisual(dream.id)}
                                style={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    aspectRatio: '1',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                    background: '#050508'
                                }}
                                className="dream-thumb"
                            >
                                <img
                                    src={dream.imageUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    alt="dream-thumbnail"
                                />
                                <div className="overlay" style={{
                                    position: 'absolute', inset: 0,
                                    padding: '16px', background: 'linear-gradient(to top, rgba(5,5,8,0.95), transparent)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                    opacity: 0, transition: 'opacity 0.25s ease'
                                }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                        {new Date(dream.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                        {dream.description}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <GlassCard style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--text-muted)', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                        <ImageIcon size={36} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p style={{ fontSize: '14px' }}>No dreams cataloged yet.</p>
                    </GlassCard>
                )
            ) : (
                visualsOnly.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {visualsOnly.map((dream) => (
                            <motion.div
                                whileHover={{ y: -4 }}
                                key={dream.id}
                                onClick={() => onViewVisual && onViewVisual(dream.id)}
                                style={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    aspectRatio: '9/16',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                    background: '#050508'
                                }}
                                className="dream-thumb"
                            >
                                <img
                                    src={dream.videoUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    alt="visual-thumbnail"
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(10, 10, 15, 0.65)',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: 'white'
                                }}>
                                    <Sparkles size={11} fill="white" /> Reel
                                </div>
                                <div className="overlay" style={{
                                    position: 'absolute', inset: 0,
                                    padding: '16px', background: 'linear-gradient(to top, rgba(5,5,8,0.95), transparent)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                    opacity: 0, transition: 'opacity 0.25s ease'
                                }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                        {new Date(dream.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                        {dream.description}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <GlassCard style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--text-muted)', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                        <Video size={36} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p style={{ fontSize: '14px' }}>No visuals generated yet.</p>
                    </GlassCard>
                )
            )}

            {userListModalConfig && (
                <UserListModal
                    title={userListModalConfig.title}
                    endpoint={userListModalConfig.endpoint}
                    onClose={() => setUserListModalConfig(null)}
                    onViewProfile={onViewProfile}
                />
            )}

            <style>{`
                .dream-thumb:hover .overlay {
                    opacity: 1 !important;
                }
                .dream-thumb img {
                    transition: transform 0.5s ease;
                }
                .dream-thumb:hover img {
                    transform: scale(1.04);
                }
            `}</style>
        </div>
    );
};

const StatBox = ({ icon: Icon, value, label, color, onClick }) => (
    <motion.div 
        whileHover={{ y: -2, background: 'rgba(255,255,255,0.05)' }}
        onClick={onClick}
        style={{ 
            textAlign: 'center', 
            padding: '14px 20px', 
            borderRadius: '16px', 
            background: 'var(--glass-bg)', 
            minWidth: '95px',
            flex: '1',
            border: 'var(--glass-border)',
            transition: 'border var(--transition-fast)',
            cursor: onClick ? 'pointer' : 'default'
        }}
    >
        <Icon size={16} color={color} style={{ marginBottom: '6px' }} />
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{label}</div>
    </motion.div>
);

export default Profile;
