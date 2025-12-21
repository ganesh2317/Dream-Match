import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Messages = ({ initialUser, onClearInitial }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

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

    const fetchMessages = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
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
        }
    }, [selectedUser]);

    useEffect(() => {
        if (initialUser) {
            setSelectedUser(initialUser);
            if (onClearInitial) onClearInitial();
        }
    }, [initialUser, onClearInitial]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !selectedUser) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${selectedUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: input })
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMessages([...messages, newMessage]);
                setInput('');
                fetchConversations(); // Refresh conversation list
            }
        } catch (error) {
            console.error(error);
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
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
                {/* Chat Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setSelectedUser(null)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.username}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '18px' }}>{selectedUser.fullName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>@{selectedUser.username}</div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            No messages yet. Start the conversation!
                        </div>
                    )}
                    {messages.map(msg => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-end' }}>
                                <img
                                    src={msg.sender.avatarUrl}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
                                />
                                <div style={{
                                    background: isMe ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '12px 18px',
                                    borderRadius: '20px',
                                    borderBottomRightRadius: isMe ? '4px' : '20px',
                                    borderBottomLeftRadius: isMe ? '20px' : '4px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    maxWidth: '70%',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div style={{ lineHeight: '1.4' }}>{msg.content}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginTop: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', padding: '0 16px', color: 'white' }}
                    />
                    <button onClick={sendMessage} style={{ background: 'var(--primary)', color: 'white', padding: '0', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Send size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 800 }}>Messages</h2>

            {conversations.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <MessageCircle size={40} color="var(--primary)" opacity={0.6} />
                    </div>
                    <h3 style={{ marginBottom: '12px', fontSize: '22px' }}>No conversations yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                        Start a conversation by visiting someone's profile!
                    </p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {conversations.map((conv) => (
                        <GlassCard
                            key={conv.id}
                            onClick={() => setSelectedUser(conv.otherUser)}
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover-bg"
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img
                                    src={conv.otherUser.avatarUrl}
                                    alt={conv.otherUser.username}
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                                        {conv.otherUser.fullName}
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {conv.lastMessage || 'No messages yet'}
                                    </div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div style={{
                                        background: 'var(--primary)',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 700
                                    }}>
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Messages;
