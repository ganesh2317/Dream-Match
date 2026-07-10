import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import { User, Lock, Mail, ArrowRight, Smile, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        age: '',
        gender: 'prefer-not-to-say'
    });
    const { sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP verification state
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const otpRefs = useRef([]);

    useEffect(() => {
        let interval = null;
        if (isOtpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (!formData.email) {
                throw new Error('Email is required');
            }
            await sendOtp(formData);
            setIsOtpSent(true);
            setTimer(60);
            setCanResend(false);
            // Autofocus first OTP box
            setTimeout(() => {
                if (otpRefs.current[0]) otpRefs.current[0].focus();
            }, 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            setError('Please enter the complete 4-digit code');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(formData.email, otpCode);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            await sendOtp(formData);
            setOtp(['', '', '', '']);
            setTimer(60);
            setCanResend(false);
            if (otpRefs.current[0]) otpRefs.current[0].focus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                otpRefs.current[index - 1].focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (!/^\d{4}$/.test(pasteData)) return;

        const digits = pasteData.split('');
        setOtp(digits);
        if (otpRefs.current[3]) otpRefs.current[3].focus();
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
                {!isOtpSent ? (
                    <>
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
                            <Input
                                icon={Mail}
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                disabled={loading}
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
                                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Sending Code...' : 'Create Account'} <ArrowRight size={18} />
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
                    </>
                ) : (
                    <>
                        <h1 style={{
                            textAlign: 'center',
                            marginBottom: '8px',
                            fontSize: '32px',
                            background: 'var(--primary-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800
                        }}>Verify Your Email</h1>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: '20px' }}>
                            We sent a 4-digit verification code to <br />
                            <strong style={{ color: 'white' }}>{formData.email}</strong>
                        </p>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(255, 118, 117, 0.1)', color: 'var(--error)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', border: '1px solid rgba(255, 118, 117, 0.2)' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px',
                                marginTop: '24px',
                                marginBottom: '24px'
                            }}>
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={otp[index]}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                        onPaste={handleOtpPaste}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            {timer > 0 ? (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Resend code in <strong style={{ color: 'white' }}>{timer}s</strong>
                                </span>
                            ) : (
                                <button
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent)',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <button
                                onClick={() => setIsOtpSent(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                &larr; Back to Registration
                            </button>
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    );
};

export default Register;
