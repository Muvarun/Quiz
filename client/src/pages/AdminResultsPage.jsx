import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptAPI } from '../services/api';

const AdminResultsPage = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        attemptAPI.getAll() // Need to add this in api.js
            .then(res => setAttempts(res.data.data))
            .catch(() => setError('Failed to load all results.'))
            .finally(() => setLoading(false));
    }, []);

    const getScoreClass = (pct) => pct >= 80 ? 'text-success' : pct >= 50 ? 'text-primary-color' : 'text-error';
    const getScoreBadge = (pct) => pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-error';
    const getScoreLabel = (pct) => pct >= 80 ? 'Excellent' : pct >= 50 ? 'Good' : 'Needs Work';

    return (
        <div className="page">
            <div className="container">
                <div className="page-header fade-in">
                    <div>
                        <h1 className="page-title">User Results 🏆</h1>
                        <p className="page-subtitle">Track and review all user quiz attempts and performance.</p>
                    </div>
                    <Link to="/admin" className="btn btn-secondary">Back to Admin</Link>
                </div>

                {loading && <div className="loading-container"><div className="spinner" /><span>Loading results…</span></div>}
                {error && <div className="alert alert-error fade-in">{error}</div>}

                {!loading && attempts.length === 0 && (
                    <div className="empty-state fade-in">
                        <div className="empty-state-icon">📭</div>
                        <h3 className="empty-state-title">No attempts found</h3>
                        <p className="empty-state-text">Users have not attempted any quizzes yet.</p>
                    </div>
                )}

                {/* All User Attempts List */}
                {!loading && attempts.length > 0 && (
                    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--surface-light)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '16px' }}>User</th>
                                    <th style={{ textAlign: 'left', padding: '16px' }}>Quiz</th>
                                    <th style={{ textAlign: 'center', padding: '16px' }}>Score</th>
                                    <th style={{ textAlign: 'center', padding: '16px' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map(a => (
                                    <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '600' }}>{a.userId?.name || 'Deleted User'}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.userId?.email}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>{a.quizId?.title || 'Deleted Quiz'}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div className={`font-bold ${getScoreClass(a.percentage)}`}>{a.score}/{a.total}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.percentage}%</div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            {new Date(a.attemptedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminResultsPage;
