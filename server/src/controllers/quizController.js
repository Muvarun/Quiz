const Quiz = require('../models/Quiz');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// @desc    Get all quizzes (Used by Admin Dashboard)
// @route   GET /api/quizzes
// @access  Private (Admin)
const getQuizzes = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can view all quizzes directly' });
        }
        const quizzes = await Quiz.find({}).populate('createdBy', 'name').sort({ createdAt: -1 });
        res.json({ success: true, count: quizzes.length, data: quizzes });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single quiz (Allows users to fetch details IF they have the joinCode, or are admin/creator)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const providedCode = req.query.joinCode?.toUpperCase();

        if (!isAdmin && quiz.joinCode !== providedCode) {
            return res.status(403).json({ success: false, message: 'You must provide a valid join code to access this quiz' });
        }

        if (!quiz.isPublished && !isAdmin) {
            return res.status(403).json({ success: false, message: 'This quiz is no longer published' });
        }

        res.json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Admin)
const createQuiz = async (req, res, next) => {
    try {
        req.body.createdBy = req.user._id;

        // Generate a random 6-character alphanumeric join code
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        req.body.joinCode = code;

        const quiz = await Quiz.create(req.body);
        res.status(201).json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
const updateQuiz = async (req, res, next) => {
    try {
        let quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await quiz.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user's quizzes
// @route   GET /api/quizzes/my
// @access  Private
const getMyQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: quizzes.length, data: quizzes });
    } catch (err) {
        next(err);
    }
};

// Helper function to fetch from Open Trivia Database (Free, No Key)
const fetchTriviaQuestions = async (topic, num) => {
    try {
        const categories = {
            'science': 17, 'computer': 18, 'software': 18, 'programming': 18, 'coding': 18, 'tech': 18, 'it': 18, 'dbms': 18, 'database': 18, 'ai': 18, 'artificial intelligence': 18, 'math': 19, 'gadget': 30,
            'history': 23, 'geography': 22, 'politics': 24, 'art': 25,
            'celebrity': 26, 'animal': 27, 'vehicle': 28, 'sport': 21,
            'music': 12, 'film': 11, 'tv': 14, 'book': 10, 'general': 9
        };

        let categoryId = 9;
        const lowerTopic = topic.toLowerCase();
        for (const [kw, id] of Object.entries(categories)) {
            if (lowerTopic.includes(kw)) {
                categoryId = id;
                break;
            }
        }

        const response = await axios.get(`https://opentdb.com/api.php?amount=${num}&category=${categoryId}&type=multiple&encode=url3986`);

        if (response.data.response_code === 0) {
            return response.data.results.map(q => {
                const incorrect = q.incorrect_answers.map(text => ({ text: decodeURIComponent(text) }));
                const correctIdx = Math.floor(Math.random() * 4);
                const options = [...incorrect];
                options.splice(correctIdx, 0, { text: decodeURIComponent(q.correct_answer) });

                return {
                    questionText: decodeURIComponent(q.question),
                    options: options.slice(0, 4),
                    correctAnswer: correctIdx
                };
            });
        }
        return null;
    } catch (err) {
        console.error('Trivia API Error:', err.message);
        return null;
    }
};

// Helper function to generate fallback questions
const generateFallbackQuestions = (topic, num) => {
    const questions = [];
    for (let i = 1; i <= num; i++) {
        questions.push({
            questionText: `Sample Question ${i} about ${topic}: What is a key characteristic of ${topic}?`,
            options: [
                { text: `Option A related to ${topic}` },
                { text: `Option B related to ${topic}` },
                { text: `Option C related to ${topic}` },
                { text: `Option D related to ${topic}` }
            ],
            correctAnswer: 0
        });
    }
    return questions;
};

// @desc    Generate quiz questions using AI (Gemini)
// @route   POST /api/quizzes/generate
// @access  Private
const generateAIQuiz = async (req, res, next) => {
    const { topic, numQuestions } = req.body;
    const fs = require('fs');

    try {
        fs.appendFileSync('ai-debug.log', `[${new Date().toISOString()}] Started Generation for: ${topic}\n`);

        if (!topic || !numQuestions) {
            return res.status(400).json({ success: false, message: 'Topic and number of questions are required' });
        }

        // --- OPTION 1: Gemini AI (Primary) ---
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `Create a quiz about "${topic}" with ${numQuestions} multiple-choice questions. 
                Return result ONLY as valid JSON matching this structure:
                {
                    "questions": [
                        {
                            "questionText": "string",
                            "options": [ { "text": "string" }, { "text": "string" }, { "text": "string" }, { "text": "string" } ],
                            "correctAnswer": 0
                        }
                    ]
                }`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const cleanJson = text.replace(/```json|```/g, '').trim();
                const generatedData = JSON.parse(cleanJson);

                return res.json({ success: true, data: generatedData.questions });
            } catch (geminiErr) {
                console.error('Gemini API Error:', geminiErr.message);
                // Handle 404 (model not found) or 429 (limit reached)
                const isUnavailable = geminiErr.message.includes('404') ||
                    geminiErr.message.includes('429') ||
                    geminiErr.message.includes('quota');

                if (isUnavailable) {
                    console.log('Gemini model unavailable or quota reached. Falling back...');
                    throw new Error('Gemini model unavailable or quota reached');
                } else {
                    throw geminiErr;
                }
            }
        }

        throw new Error('Gemini API key not configured');

    } catch (err) {
        const errorLog = `[${new Date().toISOString()}] AI Error: ${err.message}\n`;
        fs.appendFileSync('ai-debug.log', errorLog);

        // --- OPTION 2: Open Trivia DB (Free) ---
        const triviaData = await fetchTriviaQuestions(topic, numQuestions);
        if (triviaData) {
            return res.json({
                success: true,
                isFallback: true,
                message: 'Gemini busy/unconfigured. Using real trivia questions from database.',
                data: triviaData
            });
        }

        // --- OPTION 3: Hardcoded Fallback ---
        const fallbackData = generateFallbackQuestions(topic || 'the topic', numQuestions || 5);
        return res.json({
            success: true,
            isFallback: true,
            message: 'All services busy. Using generated sample questions.',
            data: fallbackData
        });
    }
};

// @desc    Toggle quiz active status
// @route   PATCH /api/quizzes/:id/activate
// @access  Private (Admin)
const toggleQuizStatus = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        quiz.isPublished = !quiz.isPublished;
        await quiz.save();
        res.json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
};

// @desc    Join quiz by enter code
// @route   POST /api/quizzes/join
// @access  Private
const joinQuizByCode = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Please provide a join code' });
        }

        const formattedCode = code.trim().toUpperCase();
        const quiz = await Quiz.findOne({ joinCode: formattedCode });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Invalid join code. Quiz not found.' });
        }

        if (!quiz.isPublished) {
            return res.status(403).json({ success: false, message: 'This quiz is currently unpublished and cannot be joined.' });
        }

        res.json({
            success: true,
            data: {
                quizId: quiz._id,
                title: quiz.title,
                joinCode: quiz.joinCode
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, getMyQuizzes, generateAIQuiz, toggleQuizStatus, joinQuizByCode };
