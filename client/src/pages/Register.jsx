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
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Cosmic Background Glows */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '460px', zIndex: 1 }}
            >
                <GlassCard style={{ padding: '48px 40px', background: 'var(--glass-bg)', border: 'var(--glass-border)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            style={{ 
                                display: 'inline-flex', 
                                padding: '12px', 
                                borderRadius: '16px', 
                                background: 'rgba(139, 92, 246, 0.15)', 
                                color: '#a78bfa',
                                marginBottom: '20px',
                                border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}
                        >
                            <img src="/logo-mark.svg" style={{ width: '32px', height: '32px', display: 'block' }} alt="DreamMatch Logo" />
                        </motion.div>
                        <h1 style={{
                            fontSize: '28px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            marginBottom: '10px'
                        }}>Create an Account</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '0.2px' }}>
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
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    color: '#fc8181', 
                                    borderRadius: 'var(--radius-md)', 
                                    marginBottom: '20px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    fontSize: '13px', 
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
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
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select
                                    value={formData.gender}
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
                                background: 'var(--primary-gradient)'
                            }}
                        >
                            {loading ? (
                                <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
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
                            }}
                            onMouseEnter={e => e.target.style.color = '#8b5cf6'}
                            onMouseLeave={e => e.target.style.color = 'var(--primary)'}
                            >
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
