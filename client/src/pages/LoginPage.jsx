import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('All fields are required'); return; }
        setLoading(true);
        try {
            const res = await authAPI.login(form);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.needsVerification) {
                navigate('/verify-email', { state: { email: err.response.data.email } });
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in">
                {/* Logo */}
                <div className="text-center" style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚡</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        QuizMaster
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Welcome back! Sign in to continue.</p>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px' }}>Sign In</h2>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email" name="email" className="form-input"
                                placeholder="you@example.com" value={form.email}
                                onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password" name="password" className="form-input"
                                placeholder="••••••••" value={form.password}
                                onChange={handleChange} required
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '16px' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: '600', textDecoration: 'none' }}>
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
