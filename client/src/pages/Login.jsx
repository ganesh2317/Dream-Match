import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [isWelcome, setIsWelcome] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestContinue = () => {
        // Fallback guest behavior (e.g. autofill demonstration credentials or alert)
        setFormData({ username: 'dreamer_guest', password: 'password123' });
        setIsWelcome(false);
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
            {/* Ambient Animated Cosmic Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 30% 30%, var(--primary-glow) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(217, 70, 239, 0.1) 0%, transparent 60%)',
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

            <AnimatePresence mode="wait">
                {isWelcome ? (
                    /* Welcome / Sign Up Screen 1 */
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '400px', zIndex: 1 }}
                    >
                        <GlassCard style={{
                            padding: '40px 32px',
                            background: 'var(--glass-bg)',
                            border: 'var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            {/* Moon Logo Box */}
                            <motion.div
                                initial={{ rotate: -10, scale: 0.9 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 12px 24px rgba(124, 58, 237, 0.3)',
                                    marginBottom: '28px',
                                    color: 'white',
                                    fontSize: '32px'
                                }}
                            >
                                🌙
                            </motion.div>

                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.04em',
                                marginBottom: '8px'
                            }}>Dream Match</h1>

                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '14px',
                                lineHeight: 1.5,
                                marginBottom: '40px',
                                maxWidth: '260px'
                            }}>
                                Where dreams connect hearts & minds
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '14px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsWelcome(false)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'var(--primary-gradient)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 20px var(--primary-glow)'
                                    }}
                                >
                                    Login
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02, background: 'var(--glass-hover)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/register')}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'transparent',
                                        border: 'var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        boxShadow: 'none'
                                    }}
                                >
                                    Sign Up
                                </motion.button>

                                <button
                                    onClick={handleGuestContinue}
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        boxShadow: 'none',
                                        padding: '8px',
                                        marginTop: '10px'
                                    }}
                                    onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                                >
                                    Continue as Guest
                                </button>
                            </div>

                            {/* Hero Artwork integration at the bottom */}
                            <div style={{
                                width: '120%',
                                height: '140px',
                                marginTop: '40px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                opacity: 0.85,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                position: 'relative'
                            }}>
                                <img
                                    src="/dream_login_hero.png"
                                    alt="Dream scape artwork"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(7,7,10,0.6) 0%, transparent 60%)'
                                }} />
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : (
                    /* Username/Password Login Form */
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '400px', zIndex: 1 }}
                    >
                        <GlassCard style={{ padding: '40px 32px', background: 'var(--glass-bg)', border: 'var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <button
                                    onClick={() => setIsWelcome(true)}
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
                                        boxShadow: 'none'
                                    }}
                                >
                                    ←
                                </button>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Log In</span>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.03em',
                                    marginBottom: '8px'
                                }}>Welcome Back</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                    Continue your journey into the dreamscape.
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
                                    icon={User}
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    disabled={loading}
                                />
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
                                        <>Sign In <ArrowRight size={16} /></>
                                    )}
                                </motion.button>
                            </form>

                            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                    New here?{' '}
                                    <Link to="/register" style={{
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        marginLeft: '4px',
                                        transition: 'color var(--transition-fast)'
                                    }}>
                                        Create an account
                                    </Link>
                                </span>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
