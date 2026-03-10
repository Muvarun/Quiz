import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptAPI } from '../services/api';

const ResultsPage = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        attemptAPI.getMy()
            .then(res => setAttempts(res.data.data))
            .catch(() => setError('Failed to load results.'))
            .finally(() => setLoading(false));
    }, []);

    const getScoreClass = (pct) => pct >= 80 ? 'text-success' : pct >= 50 ? 'text-primary-color' : 'text-error';
    const getScoreBadge = (pct) => pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-error';
    const getScoreLabel = (pct) => pct >= 80 ? 'Excellent' : pct >= 50 ? 'Good' : 'Needs Work';

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts) : 0;
    const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
    const passing = attempts.filter(a => a.percentage >= 50).length;

    return (
        <div className="page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title">My Results 🏆</h1>
                    <p className="page-subtitle">Your complete quiz attempt history and scores.</p>
                </div>

                {/* Stats Row */}
                {totalAttempts > 0 && (
                    <div className="grid grid-auto fade-in" style={{ marginBottom: '36px' }}>
                        {[
                            { label: 'Total Attempts', value: totalAttempts, icon: '🎯' },
                            { label: 'Average Score', value: `${avgScore}%`, icon: '📊' },
                            { label: 'Best Score', value: `${bestScore}%`, icon: '⭐' },
                            { label: 'Passed', value: passing, icon: '✅' },
                        ].map(s => (
                            <div key={s.label} className="stat-card">
                                <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div className="loading-container"><div className="spinner" /><span>Loading results…</span></div>}
                {error && <div className="alert alert-error fade-in">{error}</div>}

                {!loading && attempts.length === 0 && (
                    <div className="empty-state fade-in">
                        <div className="empty-state-icon">📭</div>
                        <h3 className="empty-state-title">No attempts yet</h3>
                        <p className="empty-state-text">You haven't attempted any quizzes. Start now!</p>
                        <Link to="/quizzes" className="btn btn-primary">Browse Quizzes</Link>
                    </div>
                )}

                {/* Attempts Table */}
                {!loading && attempts.length > 0 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {attempts.map(a => (
                            <div key={a._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', color: 'inherit' }}>
                                {/* Score Circle */}
                                <div style={{
                                    minWidth: '70px', height: '70px', borderRadius: '50%',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    border: `3px solid ${a.percentage >= 80 ? 'var(--success)' : a.percentage >= 50 ? 'var(--warning)' : 'var(--error)'}`,
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }} className={getScoreClass(a.percentage)}>{a.percentage}%</span>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ fontWeight: '700', marginBottom: '4px' }}>{a.quizId?.title || 'Deleted Quiz'}</h3>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            📅 {new Date(a.attemptedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Score: <strong style={{ color: 'var(--text-primary)' }}>{a.score}/{a.total}</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                                    <span className={`badge ${getScoreBadge(a.percentage)}`}>{getScoreLabel(a.percentage)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsPage;
