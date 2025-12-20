import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const Messages = ({ currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Load messages
        const load = () => {
            const msgs = JSON.parse(localStorage.getItem('global_chat') || '[]');
            setMessages(msgs);
        }
        load();
        const interval = setInterval(load, 2000); // Poll for new messages
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        const newMsg = {
            id: Date.now(),
            text: input,
            sender: currentUser.username,
            avatar: currentUser.avatarUrl,
            timestamp: new Date()
        };
        const updated = [...messages, newMsg];
        localStorage.setItem('global_chat', JSON.stringify(updated));
        setMessages(updated);
        setInput('');
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '16px' }}>Global Dreamers Chat</h2>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>No messages yet. Say hi!</div>}
                {messages.map(msg => {
                    const isMe = msg.sender === currentUser.username;
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-end' }}>
                            <img src={msg.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
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
                                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', textAlign: isMe ? 'right' : 'left' }}>{msg.sender}</div>
                                <div style={{ lineHeight: '1.4' }}>{msg.text}</div>
                            </div>
                        </div>
                    )
                })}
                <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50px', marginTop: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Type a message..."
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', padding: '0 16px', color: 'white' }}
                />
                <button onClick={send} style={{ background: 'var(--primary)', color: 'white', padding: '0', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    )
}

export default Messages;
