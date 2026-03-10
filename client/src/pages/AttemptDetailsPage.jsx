import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { attemptAPI } from '../services/api';

const AttemptDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        attemptAPI.getById(id)
            .then(res => setAttempt(res.data.data))
            .catch(() => setError('Failed to load attempt details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const getScoreClass = (pct) => pct >= 80 ? 'text-success' : pct >= 50 ? 'text-primary-color' : 'text-error';
    const getScoreLabel = (pct) => pct >= 80 ? 'excellent' : pct >= 50 ? 'good' : 'poor';
    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading details…</span></div>;
    if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;
    if (!attempt) return null;

    const quiz = attempt.quizId;

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="page-title">Attempt Review</h1>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
                </div>

                {/* score header */}
                <div className="card fade-in" style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <div className={`score-circle ${getScoreLabel(attempt.percentage)}`}>
                            <span>{attempt.percentage}%</span>
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>{quiz?.title || 'Deleted Quiz'}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Attempted on {new Date(attempt.attemptedAt).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{attempt.score}/{attempt.total}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }} />
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{attempt.percentage}%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
                        </div>
                    </div>
                </div>

                {/* question breakdown */}
                <div className="fade-in">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Question Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {attempt.answers.map((ans, idx) => {
                            const isCorrect = ans.selectedOption === ans.correctAnswer;
                            return (
                                <div key={idx} className="card" style={{ borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                                        <span className={`badge ${isCorrect ? 'badge-success' : 'badge-error'}`} style={{ flexShrink: 0 }}>
                                            Q{idx + 1}: {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                        <p style={{ fontWeight: '600' }}>{ans.questionText}</p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {ans.options.map((opt, oIdx) => {
                                            let cls = 'option-btn';
                                            if (oIdx === ans.correctAnswer) cls += ' correct';
                                            else if (oIdx === ans.selectedOption && !isCorrect) cls += ' incorrect';

                                            // Make them non-clickable but look like options
                                            return (
                                                <div key={oIdx} className={cls} style={{ cursor: 'default' }}>
                                                    <span className="option-letter">{optionLetters[oIdx]}</span>
                                                    <span>{opt.text}</span>
                                                    {oIdx === ans.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓ Correct Answer</span>}
                                                    {oIdx === ans.selectedOption && !isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}>Your Choice</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center" style={{ marginTop: '40px' }}>
                    <Link to="/quizzes" className="btn btn-primary">Try Another Quiz</Link>
                </div>
            </div>
        </div>
    );
};

export default AttemptDetailsPage;
