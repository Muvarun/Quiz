import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user', adminSecret: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address';
        if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password
            };
            if (form.role === 'admin' && form.adminSecret) {
                payload.adminSecret = form.adminSecret;
            }

            const res = await authAPI.register(payload);
            navigate('/verify-email', { state: { email: form.email } });
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in">
                <div className="text-center" style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚡</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        QuizMaster
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Join thousands of learners today.</p>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px' }}>Create Account</h2>

                    {apiError && <div className="alert alert-error">{apiError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Role</label>
                            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                                <option value="user">User (Attempt Quizzes)</option>
                                <option value="admin">Admin (Manage Platform)</option>
                            </select>
                        </div>
                        {form.role === 'admin' && (
                            <div className="form-group slide-down" style={{ marginTop: '16px' }}>
                                <label className="form-label text-warning" style={{ color: '#eab308' }}>Institute Admin Secret Key</label>
                                <input type="password" name="adminSecret" className="form-input" placeholder="Enter the secret phrase" value={form.adminSecret} onChange={handleChange} required />
                                <span className="form-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You must provide the institute's secret phrase to register as an admin.</span>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
