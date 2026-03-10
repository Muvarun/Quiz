import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await authAPI.forgotPassword({ email });
            setSuccess('Password reset OTP sent to your email successfully!');
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in card">
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px' }}>Forgot Password</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Enter your email address and we will send you an OTP to reset your password.
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
                        {loading ? <><span className="spinner spinner-sm" /> Sending OTP…</> : 'Send Reset OTP'}
                    </button>
                </form>

                <div className="divider" />
                <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Remember your password?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
