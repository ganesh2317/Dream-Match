import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Search as SearchIcon, UserPlus, UserMinus, User, Zap } from 'lucide-react';

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
        <div style={{ maxWidth: '700px', margin: '0 auto' }} className="fade-in">
            <h2 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: 800 }}>Explore Souls</h2>

            <div style={{ position: 'relative', marginBottom: '40px' }}>
                <SearchIcon style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username or name..."
                    style={{
                        width: '100%',
                        padding: '20px 20px 20px 56px',
                        background: 'var(--glass-bg)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '17px',
                        outline: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : users.length > 0 ? (
                    users.map(user => (
                        <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />
                    ))
                ) : query && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <User size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p>No spirits found with that name.</p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <Zap size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p>Type to search for companions in the dreamscape.</p>
                    </div>
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
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            className="hover-bg"
        >
            <img src={user.avatarUrl} alt={user.username} style={{ width: '60px', height: '60px', borderRadius: '18px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.fullName}</div>
                <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>@{user.username}</div>
                {user.bio && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</div>}
            </div>
            <button
                onClick={toggleFollow}
                style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: isFollowing ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                    border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    color: 'white',
                    transition: 'all 0.2s'
                }}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        </GlassCard>
    );
};

export default Search;
