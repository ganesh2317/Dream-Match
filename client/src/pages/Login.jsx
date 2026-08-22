import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { theme, toggleTheme } = useTheme();
    const [isWelcome, setIsWelcome] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Enter your username and password to continue.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Wrong username or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestContinue = () => {
        setFormData({ username: 'demo', password: 'password123' });
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
            background: 'var(--bg-dark)',
        }}>
            {/* Ambient nocturnal glow — no particles */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(ellipse at 30% 25%, var(--phosphor-glow) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, var(--afterimage-glow) 0%, transparent 55%)',
                zIndex: 0,
                pointerEvents: 'none',
            }} />

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    zIndex: 10,
                    background: 'var(--glass-float-bg)',
                    color: theme === 'dark' ? 'var(--afterimage)' : 'var(--phosphor)',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--glass-float-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    boxShadow: 'var(--shadow-low)',
                    transform: 'none',
                    backdropFilter: 'var(--glass-float-blur)',
                }}
            >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <AnimatePresence mode="wait">
                {isWelcome ? (
                    /* Welcome Screen */
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '390px', zIndex: 1 }}
                    >
                        <GlassCard level="float" style={{
                            padding: '44px 36px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            {/* Moon icon mark */}
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
                                style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, var(--phosphor) 0%, var(--phosphor-dim) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 12px 28px var(--phosphor-glow)',
                                    marginBottom: '28px',
                                    fontSize: '30px',
                                }}
                            >
                                🌙
                            </motion.div>

                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                marginBottom: '10px',
                                color: 'var(--text-primary)',
                            }}>DreamMatch</h1>

                            <p style={{
                                fontFamily: 'var(--font-body)',
                                color: 'var(--fog)',
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.6,
                                marginBottom: '40px',
                                maxWidth: '240px',
                            }}>
                                Where dreams find each other in the dark.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px' }}>
                                <button
                                    onClick={() => setIsWelcome(false)}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'var(--primary-gradient)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 600,
                                        boxShadow: '0 6px 20px var(--phosphor-glow)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    Sign in
                                </button>

                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'transparent',
                                        border: 'var(--glass-float-border)',
                                        color: 'var(--text-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 500,
                                        boxShadow: 'none',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    Create account
                                </button>

                                <button
                                    onClick={handleGuestContinue}
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--fog)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 400,
                                        boxShadow: 'none',
                                        padding: '8px',
                                        marginTop: '4px',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    Continue as guest
                                </button>
                            </div>

                            {/* Hero artwork */}
                            <div style={{
                                width: '115%',
                                height: '130px',
                                marginTop: '40px',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                opacity: 0.82,
                                border: '1px solid rgba(196, 205, 232, 0.07)',
                                position: 'relative',
                            }}>
                                <img
                                    src="/dream_login_hero.png"
                                    alt="Dreamscape artwork"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(8,9,18,0.65) 0%, transparent 55%)',
                                }} />
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : (
                    /* Login form */
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '390px', zIndex: 1 }}
                    >
                        <GlassCard level="float" style={{ padding: '44px 36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                                <button
                                    onClick={() => setIsWelcome(true)}
                                    aria-label="Back to welcome"
                                    style={{
                                        background: 'var(--glass-whisper-bg)',
                                        color: 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'none',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '16px',
                                    }}
                                >
                                    ←
                                </button>
                                <span style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--fog)',
                                    fontWeight: 500,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}>Sign In</span>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.02em',
                                    marginBottom: '6px',
                                }}>Welcome back</h2>
                                <p style={{
                                    fontFamily: 'var(--font-body)',
                                    color: 'var(--fog)',
                                    fontSize: 'var(--text-sm)',
                                }}>
                                    Pick up where your last dream ended.
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{
                                            padding: '13px 15px',
                                            background: 'var(--alert-glow)',
                                            color: 'var(--alert)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: 'var(--text-sm)',
                                            border: '1px solid rgba(248, 113, 113, 0.2)',
                                            fontFamily: 'var(--font-body)',
                                            fontWeight: 500,
                                        }}>
                                            <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                            <span>{error}</span>
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
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 600,
                                        marginTop: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: loading ? 0.8 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        background: 'var(--primary-gradient)',
                                        boxShadow: '0 6px 20px var(--phosphor-glow)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    {loading ? (
                                        <div className="loading-spinner" style={{ width: '18px', height: '18px' }} />
                                    ) : (
                                        <>Sign In <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: '28px', textAlign: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fog)', fontSize: 'var(--text-sm)' }}>
                                    New here?{' '}
                                    <Link to="/register" style={{
                                        color: 'var(--phosphor)',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        marginLeft: '4px',
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
