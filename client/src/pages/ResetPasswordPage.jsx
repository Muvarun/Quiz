import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPasswordPage = () => {
    const location = useLocation();
    const [form, setForm] = useState({
        email: location.state?.email || '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.email || !form.otp || !form.newPassword || !form.confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword({
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword
            });
            setSuccess('Password has been reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in card">
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px' }}>Reset Password</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Enter the OTP sent to your email and your new password.
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email" name="email" className="form-input"
                            value={form.email}
                            onChange={handleChange} required
                            readOnly={!!location.state?.email}
                            style={location.state?.email ? { backgroundColor: 'var(--bg-dark)' } : {}}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">6-Digit OTP</label>
                        <input
                            type="text" name="otp" className="form-input"
                            placeholder="------" value={form.otp}
                            onChange={handleChange} required
                            maxLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password" name="newPassword" className="form-input"
                            placeholder="••••••••" value={form.newPassword}
                            onChange={handleChange} required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password" name="confirmPassword" className="form-input"
                            placeholder="••••••••" value={form.confirmPassword}
                            onChange={handleChange} required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
                        {loading ? <><span className="spinner spinner-sm" /> Resetting…</> : 'Reset Password'}
                    </button>
                </form>

                <div className="divider" />
                <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
