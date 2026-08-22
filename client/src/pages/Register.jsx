import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, ArrowRight, Smile, AlertCircle, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { theme, toggleTheme } = useTheme();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        age: '',
        gender: 'prefer-not-to-say',
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.username || !formData.password || !formData.age) {
            setError('Fill in all fields to continue.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectStyle = {
        width: '100%',
        fontFamily: 'var(--font-body)',
        padding: '13px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--input-border)',
        background: 'var(--input-bg)',
        fontSize: 'var(--text-base)',
        height: '50px',
        outline: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
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
            {/* Ambient glow — no particles */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(ellipse at 70% 25%, var(--phosphor-glow) 0%, transparent 55%), radial-gradient(ellipse at 30% 75%, var(--afterimage-glow) 0%, transparent 55%)',
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '420px', zIndex: 1 }}
            >
                <GlassCard level="float" style={{ padding: '44px 36px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <Link
                            to="/login"
                            aria-label="Back to sign in"
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
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '16px',
                                flexShrink: 0,
                            }}
                        >
                            ←
                        </Link>
                        <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--fog)',
                            fontWeight: 500,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                        }}>Create Account</span>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-xl)',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                            marginBottom: '6px',
                        }}>Start dreaming</h2>
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            color: 'var(--fog)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            Join and find others who share your inner world.
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
                                    <AlertCircle size={15} style={{ flexShrink: 0 }} /> <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <Input
                            icon={Smile}
                            placeholder="Full name"
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
                        />

                        <div style={{ display: 'flex', gap: '14px' }}>
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
                            <div style={{ flex: 1 }}>
                                <select
                                    value={formData.gender}
                                    aria-label="Gender"
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    disabled={loading}
                                    style={selectStyle}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid var(--phosphor)';
                                        e.target.style.boxShadow = 'var(--focus-ring)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid var(--input-border)';
                                        e.target.style.boxShadow = 'none';
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
                                marginTop: '24px',
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
                                <>Create account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fog)', fontSize: 'var(--text-sm)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: 'var(--phosphor)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                marginLeft: '4px',
                            }}>
                                Sign in
                            </Link>
                        </span>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
