import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, attemptAPI } from '../services/api';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalQuizzes: 0, myQuizzes: 0, myAttempts: 0, avgScore: 0 });
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    // Banner State
    const [showBanner, setShowBanner] = useState(() => {
        return localStorage.getItem('hideProfileBanner') !== 'true';
    });

    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [quizzesRes, myQuizzesRes, attemptsRes] = await Promise.all([
                    quizAPI.getAll(),
                    quizAPI.getMy(),
                    attemptAPI.getMy(),
                ]);
                const attempts = attemptsRes.data.data;
                const avgScore = attempts.length > 0
                    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
                    : 0;
                setStats({
                    totalQuizzes: quizzesRes.data.count,
                    myQuizzes: myQuizzesRes.data.count,
                    myAttempts: attempts.length,
                    avgScore,
                });
                setRecentAttempts(attempts.slice(0, 3));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getScoreClass = (pct) => pct >= 80 ? 'text-success' : pct >= 50 ? '' : 'text-error';

    const handleJoinQuiz = async (e) => {
        e.preventDefault();
        setJoinError('');
        if (!joinCode.trim()) {
            setJoinError('Please enter a join code.');
            return;
        }

        setJoining(true);
        try {
            const res = await quizAPI.joinQuiz(joinCode);
            // On success, redirect to attempt page and pass the joinCode in state so frontend can fetch if needed
            navigate(`/quizzes/${res.data.data.quizId}/attempt`, { state: { joinCode: res.data.data.joinCode } });
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Failed to join quiz. Invalid code?');
        } finally {
            setJoining(false);
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        localStorage.setItem('hideProfileBanner', 'true');
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="page-header fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="page-subtitle">Here's what's happening on your quiz platform.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link to="/quizzes" className="btn btn-secondary">Browse Quizzes</Link>
                        {user?.role === 'admin' ? (
                            <>
                                <Link to="/admin" className="btn btn-secondary">🔐 Admin Panel</Link>
                                <Link to="/quizzes/create" className="btn btn-primary">+ Create Quiz</Link>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Profile Update Ad Banner */}
                {showBanner && (
                    <div className="fade-in" style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #6c63ff 0%, #3f3d56 100%)',
                        color: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        marginBottom: '40px',
                        boxShadow: '0 10px 30px rgba(108, 99, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative background circle */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ zIndex: 1, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.8rem' }}>🚀</span>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'white' }}>Level Up Your Profile!</h2>
                                <span className="badge" style={{ background: '#ff6b6b', color: 'white', border: 'none' }}>NEW</span>
                            </div>
                            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5' }}>
                                Stand out on the leaderboard! Complete your profile by adding an avatar, bio, and your favorite topics to unlock personalized quiz recommendations.
                            </p>
                        </div>

                        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
                            <Link to="/profile" className="btn" style={{
                                background: 'white',
                                color: '#6c63ff',
                                fontWeight: '700',
                                padding: '10px 24px',
                                textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                                Update Profile Now →
                            </Link>
                            <button onClick={dismissBanner} style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                title="Dismiss"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-auto fade-in" style={{ marginBottom: '40px' }}>
                    {[
                        { label: 'Total Quizzes', value: stats.totalQuizzes, icon: '📚' },
                        { label: 'My Quizzes', value: stats.myQuizzes, icon: '✏️' },
                        { label: 'Attempts Made', value: stats.myAttempts, icon: '🎯' },
                        { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: '⭐' },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                            <div className="stat-value">{loading ? '—' : s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions & Join */}
                <div className="grid grid-2 fade-in" style={{ marginBottom: '40px' }}>
                    {/* Join via Code */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
                        <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>Join a Quiz</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Have a join code from your admin or teacher? Enter it below to start answering.
                        </p>

                        <form onSubmit={handleJoinQuiz} style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter 6-digit Code (e.g. ABC123)"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    style={{ textTransform: 'uppercase', flex: 1 }}
                                    maxLength={10}
                                />
                                <button type="submit" className="btn btn-primary" disabled={joining}>
                                    {joining ? '…' : 'Join'}
                                </button>
                            </div>
                            {joinError && <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{joinError}</div>}
                        </form>
                    </div>

                    {/* Browse Quizzes Option */}
                    <Link to="/quizzes" className="card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧠</div>
                        <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>Take a Practice Quiz</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Browse the open public quiz library and challenge yourself to improve your knowledge across a variety of topics!
                        </p>
                        <div style={{ marginTop: '16px', color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: '600' }}>
                            Explore public quizzes →
                        </div>
                    </Link>
                </div>

                {/* Recent Attempts */}
                <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Recent Attempts</h2>
                        <Link to="/results" style={{ color: 'var(--primary-light)', fontSize: '0.9rem', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    {loading ? (
                        <div className="loading-container"><div className="spinner" /></div>
                    ) : recentAttempts.length === 0 ? (
                        <div className="card text-center">
                            <p style={{ color: 'var(--text-secondary)' }}>No attempts yet. <Link to="/quizzes" style={{ color: 'var(--primary-light)' }}>Take your first quiz!</Link></p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentAttempts.map(a => (
                                <div key={a._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', color: 'inherit' }}>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{a.quizId?.title || 'Deleted Quiz'}</p>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {new Date(a.attemptedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`font-bold ${getScoreClass(a.percentage)}`} style={{ fontSize: '1.1rem' }}>{a.score}/{a.total}</span>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
