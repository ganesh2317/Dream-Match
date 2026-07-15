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

const Messages = ({ currentUser, initialUser, onClearInitial }) => {
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
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.username}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)', padding: '1px' }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{selectedUser.fullName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{selectedUser.username}</div>
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
                                                <CheckCheck size={11} style={{ color: 'var(--success)' }} />
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

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }} className="fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Messages</h2>

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
                        {conversations.map((conv, idx) => (
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
                                        border: 'var(--glass-border)',
                                        borderRadius: 'var(--radius-xl)'
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
                                                padding: '1px'
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', color: 'var(--text-primary)' }}>
                                                {conv.otherUser.fullName}
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
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Messages;
