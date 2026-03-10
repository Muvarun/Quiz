import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Get email from router state, or default to empty
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email || !otp) { setError('Email and OTP are required'); return; }

        setLoading(true);
        try {
            const res = await authAPI.verifyEmail({ email, otp });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) { setError('Please enter your email first to resend OTP'); return; }
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await authAPI.resendOtp({ email });
            setMessage(res.data.message || 'OTP resent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in">
                <div className="text-center" style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✉️</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Verify Email
                    </h1>
                </div>

                <div className="card">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
                        We sent a 6-digit code to your email. Please enter it below.
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}
                    {message && <div className="alert alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{message}</div>}

                    <form onSubmit={handleVerify}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email" className="form-input"
                                placeholder="you@example.com" value={email}
                                onChange={(e) => setEmail(e.target.value)} required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">6-Digit OTP</label>
                            <input
                                type="text" className="form-input"
                                placeholder="123456" value={otp}
                                onChange={(e) => setOtp(e.target.value)} required
                                maxLength={6}
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? <><span className="spinner spinner-sm" /> Verifying…</> : 'Verify & Login'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Didn't receive the code?{' '}
                        <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                            Resend it
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
