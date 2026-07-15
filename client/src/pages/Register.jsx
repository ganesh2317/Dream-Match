import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, ArrowRight, Smile, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.username || !formData.password || !formData.age) {
            setError('Please fill in all required fields');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-dark)'
        }}>
            {/* Ambient Cosmic Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 30% 70%, var(--primary-glow) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(217, 70, 239, 0.1) 0%, transparent 60%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Glowing floating particle animation backdrops */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.4 }}>
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [Math.random() * 800, Math.random() * -200],
                            x: [Math.random() * 1000, Math.random() * 1000 + 50],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 15,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        style={{
                            position: 'absolute',
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                            borderRadius: '50%',
                            background: 'white',
                            boxShadow: '0 0 10px white'
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '420px', zIndex: 1 }}
            >
                <GlassCard style={{ padding: '40px 32px', background: 'var(--glass-bg)', border: 'var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <Link
                            to="/login"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'none',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            ←
                        </Link>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Create Account</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.03em',
                            marginBottom: '8px'
                        }}>Get Started</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            Begin capturing and connecting your dreams.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{
                                    padding: '14px 16px',
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    color: '#fc8181',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '13px',
                                    border: '1px solid rgba(220, 38, 38, 0.2)',
                                    fontWeight: 500
                                }}>
                                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <Input
                            icon={Smile}
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <Input
                            icon={User}
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                            style={{ marginTop: '16px' }}
                        />

                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    type="number"
                                    placeholder="Age"
                                    aria-label="Age"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select
                                    value={formData.gender}
                                    aria-label="Gender"
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        fontSize: '15px',
                                        height: '50px',
                                        outline: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid var(--primary)';
                                        e.target.style.boxShadow = 'var(--focus-ring)';
                                        e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                    }}
                                >
                                    <option value="male" style={{ background: '#0a0a0f', color: 'white' }}>Male</option>
                                    <option value="female" style={{ background: '#0a0a0f', color: 'white' }}>Female</option>
                                    <option value="other" style={{ background: '#0a0a0f', color: 'white' }}>Other</option>
                                    <option value="prefer-not-to-say" style={{ background: '#0a0a0f', color: 'white' }}>Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                            style={{ marginTop: '16px' }}
                        />

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '15px',
                                fontWeight: 700,
                                marginTop: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all var(--transition-fast)',
                                opacity: loading ? 0.8 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                background: 'var(--primary-gradient)',
                                boxShadow: '0 8px 20px var(--primary-glow)'
                            }}
                        >
                            {loading ? (
                                <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }} />
                            ) : (
                                <>Sign Up <ArrowRight size={16} /></>
                            )}
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                marginLeft: '4px',
                                transition: 'color var(--transition-fast)'
                            }}>
                                Sign In
                            </Link>
                        </span>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
