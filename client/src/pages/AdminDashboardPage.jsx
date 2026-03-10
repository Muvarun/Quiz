import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, attemptAPI } from '../services/api';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalQuizzes: 0, totalAttempts: 0, activeQuizzes: 0 });
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [quizzesRes, attemptsRes] = await Promise.all([
                    quizAPI.getAll(),
                    attemptAPI.getAll(), // Needs this in api.js
                ]);
                const allQuizzes = quizzesRes.data.data;
                setQuizzes(allQuizzes);
                setStats({
                    totalQuizzes: quizzesRes.data.count,
                    totalAttempts: attemptsRes.data.count,
                    activeQuizzes: allQuizzes.filter(q => q.isPublished).length,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleToggleActive = async (id) => {
        try {
            await quizAPI.toggleActive(id); // Needs this in api.js
            setQuizzes(quizzes.map(q => q._id === id ? { ...q, isPublished: !q.isPublished } : q));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header fade-in">
                    <div>
                        <h1 className="page-title">Admin Dashboard 🛡️</h1>
                        <p className="page-subtitle">Manage quizzes and monitor platform activity.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link to="/results/all" className="btn btn-secondary">View All Results</Link>
                        <Link to="/quizzes/create" className="btn btn-primary">+ Create New Quiz</Link>
                    </div>
                </div>

                {/* Admin Stats */}
                <div className="grid grid-auto fade-in" style={{ marginBottom: '40px' }}>
                    {[
                        { label: 'Total Quizzes', value: stats.totalQuizzes, icon: '📚' },
                        { label: 'Active Quizzes', value: stats.activeQuizzes, icon: '✅' },
                        { label: 'Total User Attempts', value: stats.totalAttempts, icon: '🎯' },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                            <div className="stat-value">{loading ? '—' : s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="fade-in">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Manage Quizzes</h2>
                    {loading ? (
                        <div className="loading-container"><div className="spinner" /></div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--surface-light)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '16px' }}>Title</th>
                                        <th style={{ textAlign: 'left', padding: '16px' }}>Author</th>
                                        <th style={{ textAlign: 'center', padding: '16px' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.map(q => (
                                        <tr key={q._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px' }}>{q.title}</td>
                                            <td style={{ padding: '16px' }}>{q.createdBy?.name || 'Unknown'}</td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span className={`badge ${q.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                                    {q.isPublished ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleToggleActive(q._id)}
                                                    className={`btn btn-sm ${q.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                                                >
                                                    {q.isPublished ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
