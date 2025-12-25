import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { Send, MessageCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Messages = ({ initialUser, onClearInitial }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);
    const pollingRef = useRef(null);

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

    const fetchMessages = async (userId, silent = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Only update if messages changed (avoid UI flicker)
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

    // Real-time polling when in a conversation
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);

            // Poll for new messages every 3 seconds
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

    // Smooth scroll to bottom when messages change
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

        // Optimistic update - show message immediately
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
                // Replace optimistic message with real one
                setMessages(prev => prev.map(msg =>
                    msg.id === optimisticMessage.id ? { ...newMessage, pending: false } : msg
                ));
                fetchConversations(); // Refresh conversation list
            } else {
                // Remove failed message
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
            }
        } catch (error) {
            console.error(error);
            // Remove failed message
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
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }} className="fade-in">
                {/* Chat Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <button
                        onClick={() => { setSelectedUser(null); setMessages([]); }}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.username}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '18px' }}>{selectedUser.fullName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>@{selectedUser.username}</div>
                    </div>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: 'var(--success)',
                        boxShadow: '0 0 8px var(--success)'
                    }} title="Online" />
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    marginBottom: '16px'
                }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>No messages yet. Say hello! 👋</p>
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
                                    animation: msg.pending ? 'none' : 'slideIn 0.3s ease-out',
                                    opacity: msg.pending ? 0.7 : 1
                                }}
                            >
                                {showAvatar ? (
                                    <img
                                        src={msg.sender?.avatarUrl || selectedUser.avatarUrl}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                ) : (
                                    <div style={{ width: '32px' }} />
                                )}
                                <div style={{
                                    background: isMe
                                        ? 'linear-gradient(135deg, var(--primary), #8b5cf6)'
                                        : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    padding: '12px 18px',
                                    borderRadius: '20px',
                                    borderBottomRightRadius: isMe ? '6px' : '20px',
                                    borderBottomLeftRadius: isMe ? '20px' : '6px',
                                    maxWidth: '70%',
                                    boxShadow: isMe ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>{msg.content}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        marginTop: '4px'
                                    }}>
                                        <span style={{ fontSize: '11px', opacity: 0.6 }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            msg.pending ?
                                                <Check size={14} style={{ opacity: 0.5 }} /> :
                                                <CheckCheck size={14} style={{ color: 'var(--success)' }} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                            fontSize: '16px',
                            padding: '8px 12px',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        style={{
                            background: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '0',
                            borderRadius: '50%',
                            width: '46px',
                            height: '46px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            cursor: input.trim() ? 'pointer' : 'default'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }} className="fade-in">
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
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="hover-bg"
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={conv.otherUser.avatarUrl}
                                        alt={conv.otherUser.username}
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(255,255,255,0.1)'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                                        {conv.otherUser.fullName}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: conv.unreadCount > 0 ? 'white' : 'var(--text-muted)',
                                        fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {conv.lastMessage || 'No messages yet'}
                                    </div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div style={{
                                        background: 'var(--primary)',
                                        borderRadius: '50%',
                                        minWidth: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '0 6px',
                                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
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
