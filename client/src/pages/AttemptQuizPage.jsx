import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizAPI, attemptAPI } from '../services/api';

const AttemptQuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const joinCode = location.state?.joinCode;

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIdx }
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        quizAPI.getById(id, joinCode)
            .then(res => setQuiz(res.data.data))
            .catch((err) => {
                if (err.response?.status === 403) {
                    setError('Unauthorized. You must provide a valid join code to attempt this quiz. Please go back to the Dashboard and join using a code.');
                } else {
                    setError('Quiz not found or failed to load.');
                }
            })
            .finally(() => setLoading(false));
    }, [id, joinCode]);

    const selectAnswer = (questionId, optionIdx) => {
        if (result) return; // locked after submission
        setAnswers(a => ({ ...a, [questionId]: optionIdx }));
    };

    const handleSubmit = async () => {
        const unanswered = quiz.questions.filter(q => answers[q._id] === undefined);
        if (unanswered.length > 0) {
            if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
        }
        setSubmitting(true);
        const payload = quiz.questions.map(q => ({
            questionId: q._id,
            selectedOption: answers[q._id] ?? -1,
        }));
        try {
            const res = await attemptAPI.submit(id, { answers: payload });
            setResult(res.data.data);
            setCurrentQ(0);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const getScoreLabel = (pct) => pct >= 80 ? 'excellent' : pct >= 50 ? 'good' : 'poor';
    const getScoreMessage = (pct) => pct >= 80 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort!' : '📖 Keep practicing!';

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading quiz…</span></div>;
    if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;
    if (!quiz) return null;

    const totalQ = quiz.questions.length;
    const answered = Object.keys(answers).length;
    const progress = Math.round((answered / totalQ) * 100);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '760px' }}>
                {/* Quiz Header */}
                <div className="card fade-in" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px' }}>{quiz.title}</h1>
                            {quiz.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{quiz.description}</p>}
                        </div>
                        <span className="badge badge-primary">{totalQ} Questions</span>
                    </div>

                    {!result && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                <span>{answered}/{totalQ} answered</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="progress"><div className="progress-bar progress-bar-primary" style={{ width: `${progress}%` }} /></div>
                        </div>
                    )}
                </div>

                {/* Result Banner */}
                {result && (
                    <div className="card fade-in" style={{ marginBottom: '24px', textAlign: 'center', borderColor: result.percentage >= 80 ? 'var(--success)' : result.percentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                        <div className={`score-circle ${getScoreLabel(result.percentage)}`} style={{ marginBottom: '16px' }}>
                            <span>{result.percentage}%</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Score</span>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>{getScoreMessage(result.percentage)}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            You scored <strong style={{ color: 'var(--text-primary)' }}>{result.score}/{result.total}</strong> correct answers.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>Browse More Quizzes</button>
                            <button className="btn btn-primary" onClick={() => navigate('/results')}>View All Results</button>
                        </div>
                    </div>
                )}

                {/* Question Navigation Dots */}
                {!result && totalQ > 1 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {quiz.questions.map((q, i) => (
                            <button key={i} onClick={() => setCurrentQ(i)}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                                    background: currentQ === i ? 'var(--primary)' : answers[q._id] !== undefined ? 'rgba(108,99,255,0.3)' : 'var(--bg-card)',
                                    color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.82rem',
                                    border: currentQ === i ? 'none' : '1px solid var(--border)',
                                    transition: 'all 0.2s'
                                }}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Question Card */}
                {quiz.questions.map((q, qi) => {
                    const isVisible = result || qi === currentQ;
                    if (!isVisible) return null;
                    const resQ = result?.result?.[qi];

                    return (
                        <div key={q._id} className="card fade-in" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                                <span className="badge badge-primary" style={{ flexShrink: 0 }}>Q{qi + 1}</span>
                                <p style={{ fontWeight: '600', fontSize: '1rem', lineHeight: '1.6' }}>{q.questionText}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {q.options.map((opt, oi) => {
                                    let cls = 'option-btn';
                                    if (result) {
                                        if (oi === resQ?.correctAnswer) cls += ' correct';
                                        else if (oi === resQ?.selectedOption && oi !== resQ?.correctAnswer) cls += ' incorrect';
                                    } else if (answers[q._id] === oi) {
                                        cls += ' selected';
                                    }
                                    return (
                                        <button key={oi} className={cls} onClick={() => selectAnswer(q._id, oi)}>
                                            <span className="option-letter">{optionLetters[oi]}</span>
                                            <span>{opt.text}</span>
                                            {result && oi === resQ?.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓</span>}
                                            {result && oi === resQ?.selectedOption && oi !== resQ?.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}>✗</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation */}
                            {!result && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={qi === 0}>
                                        ← Previous
                                    </button>
                                    {qi < totalQ - 1
                                        ? <button className="btn btn-primary btn-sm" onClick={() => setCurrentQ(q => q + 1)}>Next →</button>
                                        : <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                                            {submitting ? <><span className="spinner spinner-sm" /> Submitting…</> : '✅ Submit Quiz'}
                                        </button>
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Submit button (when reviewing all answered) */}
                {!result && (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <><span className="spinner spinner-sm" /> Submitting…</> : '✅ Submit Quiz'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttemptQuizPage;
