import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

const emptyOption = () => ({ text: '' });
const emptyQuestion = () => ({
    questionText: '',
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    correctAnswer: 0,
});

const CreateQuizPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('ai'); // 'manual' or 'ai'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // AI Generation state
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState('');

    const handleGenerateAI = async () => {
        if (!aiTopic.trim()) {
            setApiError('Please enter a topic for AI generation');
            return;
        }
        setApiError('');
        setIsFallback(false);
        setFallbackMessage('');
        setGenerating(true);
        try {
            const response = await quizAPI.generateAI({ topic: aiTopic, numQuestions: aiCount });
            const res = response.data;

            setQuestions(res.data);

            if (res.isFallback) {
                setIsFallback(true);
                setFallbackMessage(res.message || 'AI quota reached. Generic sample questions provided.');
            }

            if (!title) setTitle(aiTopic);
            setMode('manual'); // Switch to manual to allow review
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to generate questions with AI.');
        } finally {
            setGenerating(false);
        }
    };

    // Question mutators
    const updateQuestion = (qi, field, value) => {
        setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: value } : q));
    };
    const updateOption = (qi, oi, value) => {
        setQuestions(qs => qs.map((q, i) => i === qi
            ? { ...q, options: q.options.map((o, j) => j === oi ? { text: value } : o) }
            : q
        ));
    };
    const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
    const removeQuestion = (qi) => {
        if (questions.length === 1) return;
        setQuestions(qs => qs.filter((_, i) => i !== qi));
    };
    const addOption = (qi) => {
        setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: [...q.options, emptyOption()] } : q));
    };
    const removeOption = (qi, oi) => {
        if (questions[qi].options.length <= 2) return;
        setQuestions(qs => qs.map((q, i) => {
            if (i !== qi) return q;
            const newOpts = q.options.filter((_, j) => j !== oi);
            const newCorrect = q.correctAnswer >= newOpts.length ? 0 : q.correctAnswer;
            return { ...q, options: newOpts, correctAnswer: newCorrect };
        }));
    };

    const validate = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Quiz title is required';
        questions.forEach((q, qi) => {
            if (!q.questionText.trim()) errs[`q_${qi}_text`] = 'Question text is required';
            q.options.forEach((o, oi) => {
                if (!o.text.trim()) errs[`q_${qi}_o_${oi}`] = 'Option text is required';
            });
        });
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
            await quizAPI.create({ title, description, questions });
            navigate('/quizzes');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to create quiz.');
        } finally {
            setLoading(false);
        }
    };

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header fade-in">
                    <h1 className="page-title">Create a Quiz ✨</h1>
                    <p className="page-subtitle">Build a quiz manually or generate one instantly using AI.</p>
                </div>

                {apiError && <div className="alert alert-error fade-in">{apiError}</div>}
                {isFallback && <div className="alert alert-info fade-in" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                    <span style={{ marginRight: '8px' }}>⚠️</span> {fallbackMessage}
                </div>}

                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }} className="fade-in">
                    <button
                        type="button"
                        className={`btn ${mode === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('ai')}
                        style={{ flex: 1 }}
                    >
                        🤖 AI Generation
                    </button>
                    <button
                        type="button"
                        className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('manual')}
                        style={{ flex: 1 }}
                    >
                        ✍️ Manual Entry
                    </button>
                </div>

                {mode === 'ai' && (
                    <div className="card fade-in" style={{ marginBottom: '24px', border: '1px solid var(--primary-light)' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>🤖 Generate with AI</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Tell AI the topic and how many questions you want. It will generate them automatically.
                        </p>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Quiz Topic</label>
                                <input
                                    type="text" className="form-input"
                                    placeholder="e.g. Modern Web Development"
                                    value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Number of Questions</label>
                                <select
                                    className="form-select"
                                    value={aiCount} onChange={e => setAiCount(Number(e.target.value))}
                                >
                                    {[3, 5, 10, 15].map(n => <option key={n} value={n}>{n} Questions</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            type="button" className="btn btn-primary btn-block"
                            onClick={handleGenerateAI} disabled={generating}
                        >
                            {generating ? <><span className="spinner spinner-sm" /> Magic in progress...</> : '✨ Generate Quiz Questions'}
                        </button>
                    </div>
                )}

                {(mode === 'manual' || (mode === 'ai' && questions.length > 1)) && (
                    <form onSubmit={handleSubmit} className="fade-in">
                        {/* Quiz Info */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📋 Quiz Details
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Quiz Title *</label>
                                <input type="text" className="form-input" placeholder="e.g. JavaScript Fundamentals" value={title} onChange={e => setTitle(e.target.value)} />
                                {errors.title && <span className="form-error">{errors.title}</span>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description (optional)</label>
                                <textarea className="form-textarea" placeholder="What is this quiz about?" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>

                        {/* Questions */}
                        {questions.map((q, qi) => (
                            <div key={qi} className="card fade-in" style={{ marginBottom: '20px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span className="badge badge-primary">Question {qi + 1}</span>
                                    {questions.length > 1 && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Question Text *</label>
                                    <textarea
                                        className="form-textarea" style={{ minHeight: '70px' }}
                                        placeholder="Enter your question here…"
                                        value={q.questionText}
                                        onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                                    />
                                    {errors[`q_${qi}_text`] && <span className="form-error">{errors[`q_${qi}_text`]}</span>}
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
                                        Answer Options * <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(click radio to mark correct)</span>
                                    </label>
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <input
                                                type="radio" name={`correct_${qi}`}
                                                checked={q.correctAnswer === oi}
                                                onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                                                title="Mark as correct answer"
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                                            />
                                            <span style={{
                                                minWidth: '28px', height: '28px', borderRadius: '50%',
                                                background: q.correctAnswer === oi ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem', fontWeight: '700', flexShrink: 0, transition: 'background 0.2s'
                                            }}>
                                                {optionLetters[oi]}
                                            </span>
                                            <input
                                                type="text" className="form-input"
                                                placeholder={`Option ${optionLetters[oi]}`}
                                                value={opt.text}
                                                onChange={e => updateOption(qi, oi, e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            {q.options.length > 2 && (
                                                <button type="button" onClick={() => removeOption(qi, oi)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', flexShrink: 0 }}>
                                                    ×
                                                </button>
                                            )}
                                            {errors[`q_${qi}_o_${oi}`] && <span className="form-error">{errors[`q_${qi}_o_${oi}`]}</span>}
                                        </div>
                                    ))}
                                    {q.options.length < 6 && (
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(qi)} style={{ marginTop: '4px' }}>
                                            + Add Option
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            <button type="button" className="btn btn-secondary" onClick={addQuestion}>+ Add Question</button>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
                                {questions.length} question{questions.length !== 1 ? 's' : ''} added
                            </span>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                            {loading ? <><span className="spinner spinner-sm" /> Publishing Quiz…</> : '🚀 Publish Quiz'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateQuizPage;
