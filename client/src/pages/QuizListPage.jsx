import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuizListPage = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState('');

    const fetchQuizzes = async () => {
        try {
            const res = await quizAPI.getAll();
            setQuizzes(res.data.data);
        } catch (err) {
            setError('Failed to load quizzes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuizzes(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        setDeleting(id);
        try {
            await quizAPI.delete(id);
            setQuizzes(q => q.filter(qz => qz._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete quiz.');
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await quizAPI.toggleActive(id);
            setQuizzes(quizzes.map(q => q._id === id ? { ...q, isPublished: !q.isPublished } : q));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle status.');
        }
    };

    const filtered = quizzes.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="container">
                <div className="page-header fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Browse Quizzes 📚</h1>
                        <p className="page-subtitle">Explore all available quizzes and test your knowledge.</p>
                    </div>
                    {user?.role === 'admin' && (
                        <Link to="/quizzes/create" className="btn btn-primary">+ Create Quiz</Link>
                    )}
                </div>

                {/* Search */}
                <div style={{ marginBottom: '28px' }} className="fade-in">
                    <input
                        type="text" className="form-input" placeholder="🔍 Search quizzes…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: '400px' }}
                    />
                </div>

                {loading && <div className="loading-container"><div className="spinner" /><span>Loading quizzes…</span></div>}
                {error && <div className="alert alert-error">{error}</div>}

                {!loading && filtered.length === 0 && (
                    <div className="empty-state fade-in">
                        <div className="empty-state-icon">📭</div>
                        <h3 className="empty-state-title">No quizzes found</h3>
                        <p className="empty-state-text">{search ? 'Try a different search term.' : 'Be the first to create a quiz!'}</p>
                        {user?.role === 'admin' && (
                            <Link to="/quizzes/create" className="btn btn-primary">Create a Quiz</Link>
                        )}
                    </div>
                )}

                <div className="grid grid-auto fade-in">
                    {filtered.map(quiz => (
                        <div key={quiz._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                            {/* Quiz info */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{quiz.questions?.length || 0} questions</span>
                                    {quiz.createdBy?._id === user?.id && <span className="badge badge-warning">My Quiz</span>}
                                    {!quiz.isPublished && <span className="badge badge-error">Draft / Inactive</span>}
                                </div>
                                <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>{quiz.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                    {quiz.description || 'No description provided.'}
                                </p>
                                {user?.role === 'admin' && quiz.joinCode && (
                                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Join Code:</span>
                                        <code style={{ background: 'var(--primary-dark)', color: 'var(--primary-light)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                            {quiz.joinCode}
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    By {quiz.createdBy?.name || 'Unknown'} · {new Date(quiz.createdAt).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link to={`/quizzes/${quiz._id}/attempt`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                        Attempt Quiz →
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <button
                                            className={`btn btn-sm ${quiz.isPublished ? 'btn-secondary' : 'btn-success'}`}
                                            onClick={() => handleToggleActive(quiz._id)}
                                            style={{ padding: '0 12px' }}
                                        >
                                            {quiz.isPublished ? '⏸️' : '▶️'}
                                        </button>
                                    )}
                                    {(user?.role === 'admin' || quiz.createdBy?._id === user?.id) && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(quiz._id)}
                                            disabled={deleting === quiz._id}
                                        >
                                            {deleting === quiz._id ? '…' : '🗑️'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizListPage;
