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
            <GlassCard style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: 'var(--ios-text-secondary)', marginBottom: '32px' }}>
                    Continue your dream journey.
                </p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--ios-red)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={User}
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: 'var(--ios-blue)',
                            color: 'white',
                            borderRadius: 'var(--border-radius-md)',
                            fontSize: '16px',
                            fontWeight: 600,
                            marginTop: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform var(--transition-fast)'
                        }}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--ios-text-secondary)', fontSize: '14px' }}>
                        New here?{' '}
                        <Link to="/register" style={{ color: 'var(--ios-blue)', textDecoration: 'none', fontWeight: 600 }}>
                            Create an account
                        </Link>
                    </span>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;
