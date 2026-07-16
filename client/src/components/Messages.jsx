import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { useAuth } from '../context/AuthContext';
import { 
    Send, 
    ArrowLeft, 
    Inbox, 
    MessageCircle, 
    Check, 
    CheckCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = ({ currentUser, initialUser, onClearInitial, onViewProfile }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const chatEndRef = useRef(null);
    const pollingRef = useRef(null);

    const [pinnedIds, setPinnedIds] = useState(() => {
        try {
            const saved = localStorage.getItem(`pinned_conversations_${user?.id}`);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const togglePin = (otherUserId) => {
        setPinnedIds(prev => {
            const next = prev.includes(otherUserId)
                ? prev.filter(id => id !== otherUserId)
                : [...prev, otherUserId];
            localStorage.setItem(`pinned_conversations_${user?.id}`, JSON.stringify(next));
            return next;
        });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId, silent = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Avoid state update if no new messages received (prevents visual flickering)
                if (!silent || JSON.stringify(data) !== JSON.stringify(messages)) {
                    setMessages(data);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);

            pollingRef.current = setInterval(() => {
                fetchMessages(selectedUser.id, true);
            }, 3000);

            return () => {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                }
            };
        }
    }, [selectedUser?.id]);

    useEffect(() => {
        if (initialUser) {
            setSelectedUser(initialUser);
            if (onClearInitial) onClearInitial();
        }
    }, [initialUser, onClearInitial]);

    useEffect(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !selectedUser || sending) return;

        const messageContent = input.trim();
        setInput('');
        setSending(true);

        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: messageContent,
            senderId: user.id,
            sender: { id: user.id, avatarUrl: user.avatarUrl },
            createdAt: new Date().toISOString(),
            pending: true
        };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${selectedUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: messageContent })
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMessages(prev => prev.map(msg =>
                    msg.id === optimisticMessage.id ? { ...newMessage, pending: false } : msg
                ));
                fetchConversations();
            } else {
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (selectedUser) {
        return (
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', maxWidth: '640px', margin: '0 auto' }} className="fade-in">
                {/* Chat Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '16px',
                    padding: '12px 18px',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-xl)',
                    border: 'var(--glass-border)'
                }}>
                    <button
                        onClick={() => { setSelectedUser(null); setMessages([]); }}
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: 'none',
                            transform: 'none',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <img
                        src={selectedUser?.avatarUrl || `https://ui-avatars.com/api/?name=${selectedUser?.username || 'user'}`}
                        alt={selectedUser?.username || 'user'}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)', padding: '1px', cursor: 'pointer' }}
                        onClick={() => onViewProfile && onViewProfile(selectedUser)}
                    />
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onViewProfile && onViewProfile(selectedUser)}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{selectedUser?.fullName || selectedUser?.username || 'Wanderer'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{selectedUser?.username || 'user'}</div>
                    </div>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--success)',
                        boxShadow: '0 0 8px var(--success)'
                    }} title="Online" />
                </div>

                {/* Messages Panel */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: '16px',
                    border: 'var(--glass-border)'
                }} className="hide-scrollbar">
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            <MessageCircle size={36} style={{ opacity: 0.2, marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
                            <p style={{ fontSize: '13px' }}>No messages yet. Say hello! 👋</p>
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === user.id;
                        const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                        return (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    gap: '10px',
                                    alignItems: 'flex-end',
                                    opacity: msg.pending ? 0.7 : 1
                                }}
                            >
                                {showAvatar ? (
                                    <img
                                        src={msg.sender?.avatarUrl || selectedUser.avatarUrl}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', objectFit: 'cover' }}
                                        alt="avatar"
                                    />
                                ) : (
                                    <div style={{ width: '28px' }} />
                                )}
                                <div style={{
                                    background: isMe
                                        ? 'var(--primary-gradient)'
                                        : 'var(--glass-bg)',
                                    color: 'var(--text-primary)',
                                    padding: '10px 14px',
                                    borderRadius: '16px',
                                    borderBottomRightRadius: isMe ? '4px' : '16px',
                                    borderBottomLeftRadius: isMe ? '16px' : '4px',
                                    maxWidth: '70%',
                                    border: isMe ? 'none' : 'var(--glass-border)',
                                    boxShadow: isMe ? '0 4px 12px var(--primary-glow)' : 'none'
                                }}>
                                    <div style={{ lineHeight: '1.4', wordBreak: 'break-word', fontSize: '13px' }}>{msg.content}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        marginTop: '4px'
                                    }}>
                                        <span style={{ fontSize: '9px', opacity: 0.5 }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            msg.pending ?
                                                <Check size={11} style={{ opacity: 0.5 }} /> :
                                                (msg.read ?
                                                    <CheckCheck size={11} style={{ color: '#00a8ff' }} /> :
                                                    <Check size={11} style={{ color: 'var(--text-muted)' }} />
                                                )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-xl)',
                    border: 'var(--glass-border)',
                    alignItems: 'center'
                }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: '14px',
                            padding: '6px 10px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        style={{
                            background: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: 'white',
                            padding: '0',
                            borderRadius: '10px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            cursor: input.trim() ? 'pointer' : 'default',
                            boxShadow: 'none',
                            transform: 'none'
                        }}
                    >
                        <Send size={16} />
                    </motion.button>
                </div>
            </div>
        );
    }

    const sortedConversations = [...conversations]
        .filter(conv => conv && conv.otherUser)
        .sort((a, b) => {
            const aPinned = pinnedIds.includes(a.otherUserId);
            const bPinned = pinnedIds.includes(b.otherUserId);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt);
        });

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '40px' }} /> {/* Spacer */}
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Messages</h2>
                <button
                    onClick={() => setShowNewChat(true)}
                    style={{
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px var(--primary-glow)'
                    }}
                    className="hover-scale"
                >
                    New Chat
                </button>
            </div>

            {conversations.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '64px 32px', border: 'var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Inbox size={32} color="var(--primary)" style={{ opacity: 0.6 }} />
                    </div>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>No conversations yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                        Start a conversation by searching for people and visiting their profile!
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                        {sortedConversations.map((conv, idx) => {
                            const isPinned = pinnedIds.includes(conv.otherUserId);
                            return (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    <GlassCard
                                        onClick={() => setSelectedUser(conv.otherUser)}
                                        style={{
                                            padding: '16px 20px',
                                            cursor: 'pointer',
                                            border: isPinned ? '1px solid var(--primary)' : 'var(--glass-border)',
                                            borderRadius: 'var(--radius-xl)',
                                            background: isPinned ? 'rgba(124, 58, 237, 0.03)' : 'var(--glass-bg)'
                                        }}
                                        className="hover-scale-subtle animate-theme"
                                    >
                                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                            <img
                                                src={conv.otherUser.avatarUrl}
                                                alt={conv.otherUser.username}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '1.5px solid var(--primary)',
                                                    padding: '1px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewProfile && onViewProfile(conv.otherUser);
                                                }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {conv.otherUser.fullName || conv.otherUser.username}
                                                    {isPinned && <span style={{ fontSize: '10px' }}>📌</span>}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                                                    fontWeight: conv.unreadCount > 0 ? 700 : 400,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {conv.lastMessage || 'No messages yet'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePin(conv.otherUserId);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                            color: isPinned ? 'var(--primary)' : 'var(--text-muted)',
                                                            cursor: 'pointer',
                                                            boxShadow: 'none',
                                                            transform: 'none',
                                                            fontSize: '13px'
                                                        }}
                                                        title={isPinned ? 'Unpin Chat' : 'Pin Chat'}
                                                    >
                                                        📌
                                                    </button>
                                                    {conv.unreadCount > 0 && (
                                                        <div style={{
                                                            background: 'var(--primary)',
                                                            borderRadius: '50%',
                                                            minWidth: '20px',
                                                            height: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            padding: '0 5px',
                                                            boxShadow: '0 2px 8px var(--primary-glow)',
                                                            color: 'white'
                                                        }}>
                                                            {conv.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {showNewChat && (
                <NewConversationModal
                    onClose={() => setShowNewChat(false)}
                    onSelect={(u) => setSelectedUser(u)}
                    onViewProfile={onViewProfile}
                />
            )}
        </div>
    );
};

const NewConversationModal = ({ onClose, onSelect, onViewProfile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

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
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>New Message</h3>
                    <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Close</button>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people..."
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white', fontSize: '14px', outline: 'none', marginBottom: '16px'
                    }}
                />
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        {searchQuery ? 'No results found' : 'Type to search for users'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }} className="hide-scrollbar">
                        {searchResults.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => { onSelect(u); onClose(); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}
                                className="hover-bg-simple"
                            >
                                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
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

export default Messages;
