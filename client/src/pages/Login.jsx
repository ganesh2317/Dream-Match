import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <GlassCard style={{ width: '100%', maxWidth: '400px', padding: '40px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '8px',
                    fontSize: '32px',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>Welcome Back</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Continue your dream journey.
                </p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 118, 117, 0.1)', color: 'var(--error)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', border: '1px solid rgba(255, 118, 117, 0.2)' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={User}
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    />
                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            marginTop: '16px',
                            fontSize: '16px'
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            marginTop: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)'
                        }}
                    >
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        New here?{' '}
                        <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                            Create an account
                        </Link>
                    </span>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;
