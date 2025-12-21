import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, Mail, ArrowRight, Smile, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        age: '',
        gender: 'prefer-not-to-say'
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate('/login');
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
            <GlassCard style={{ width: '100%', maxWidth: '450px', padding: '40px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '8px',
                    fontSize: '32px',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>Join Dream Match</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Start tracking your dreams today.
                </p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 118, 117, 0.1)', color: 'var(--error)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', border: '1px solid rgba(255, 118, 117, 0.2)' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={Smile}
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '16px' }}
                    />
                    <Input
                        icon={User}
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            fontSize: '16px',
                            marginTop: '16px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                type="number"
                                placeholder="Age"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    fontSize: '16px',
                                    height: '52px',
                                    outline: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="male" style={{ color: 'black' }}>Male</option>
                                <option value="female" style={{ color: 'black' }}>Female</option>
                                <option value="other" style={{ color: 'black' }}>Other</option>
                                <option value="prefer-not-to-say" style={{ color: 'black' }}>Prefer not to say</option>
                            </select>
                        </div>
                    </div>
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
                            fontSize: '16px',
                            marginTop: '16px'
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
                        Create Account <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                            Sign In
                        </Link>
                    </span>
                </div>
            </GlassCard>
        </div>
    );
};

export default Register;
