import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Search as SearchIcon, UserPlus, UserMinus, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ onViewProfile }) => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query) handleSearch();
            else setUsers([]);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }} className="fade-in">
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Souls</h2>

            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username or name..."
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        fontSize: '15px',
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : users.length > 0 ? (
                    <AnimatePresence>
                        {users.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                            >
                                <UserCard user={user} onViewProfile={onViewProfile} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : query && !loading ? (
                    <GlassCard style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', border: 'var(--glass-border)' }}>
                        <User size={36} style={{ opacity: 0.2, marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
                        <p style={{ fontSize: '14px' }}>No spirits found with that name.</p>
                    </GlassCard>
                ) : (
                    <GlassCard style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', border: 'var(--glass-border)' }}>
                        <Zap size={36} style={{ opacity: 0.2, marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
                        <p style={{ fontSize: '14px' }}>Type to search for companions in the dreamscape.</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};

const UserCard = ({ user, onViewProfile }) => {
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

    const toggleFollow = async (e) => {
        e.stopPropagation();
        const endpoint = isFollowing ? 'unfollow' : 'follow';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${endpoint}/${user.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <GlassCard
            onClick={() => onViewProfile && onViewProfile(user)}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: 'var(--glass-border)' }}
            className="hover-scale-subtle"
        >
            <img src={user.avatarUrl} alt={user.username} style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.06)' }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{user.fullName}</div>
                <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>@{user.username}</div>
                {user.bio && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</div>}
            </div>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleFollow}
                style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: isFollowing ? 'rgba(255,255,255,0.04)' : 'var(--primary)',
                    border: isFollowing ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: 'white',
                    boxShadow: isFollowing ? 'none' : '0 4px 10px var(--primary-glow)',
                    transform: 'none'
                }}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </motion.button>
        </GlassCard>
    );
};

export default Search;
