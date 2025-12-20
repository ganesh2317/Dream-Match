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
            <GlassCard style={{ width: '100%', maxWidth: '450px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px' }}>Join DreamSocial</h2>
                <p style={{ textAlign: 'center', color: 'var(--ios-text-secondary)', marginBottom: '32px' }}>
                    Start tracking your dreams today.
                </p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--ios-red)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={Smile}
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    <Input
                        icon={User}
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                type="number"
                                placeholder="Age"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    border: 'none',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '16px',
                                    color: 'var(--ios-text-primary)',
                                    height: '46px',
                                    marginBottom: '16px'
                                }}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
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
                        Create Account <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--ios-text-secondary)', fontSize: '14px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--ios-blue)', textDecoration: 'none', fontWeight: 600 }}>
                            Sign In
                        </Link>
                    </span>
                </div>
            </GlassCard>
        </div>
    );
};

export default Register;
