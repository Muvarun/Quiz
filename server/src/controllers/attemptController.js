 const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// @desc    Submit quiz attempt and calculate score
// @route   POST /api/attempts/:quizId
// @access  Private
const submitAttempt = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const { answers } = req.body; // [{ questionId, selectedOption }]

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers must be provided as an array',
            });
        }

        // Calculate score
        let score = 0;
        const total = quiz.questions.length;
        const gradedAnswers = [];

        for (const question of quiz.questions) {
            const answer = answers.find(
                (a) => a.questionId === question._id.toString()
            );
            const selectedOption = answer ? answer.selectedOption : -1;
            const isCorrect = selectedOption === question.correctAnswer;

            if (isCorrect) score++;

            gradedAnswers.push({
                questionId: question._id,
                selectedOption,
            });
        }

        const attempt = await Attempt.create({
            userId: req.user._id,
            quizId: quiz._id,
            answers: gradedAnswers,
            score,
            total,
        });

        // Return detailed result with correct/incorrect info
        const result = quiz.questions.map((q, idx) => {
            const answer = answers.find((a) => a.questionId === q._id.toString());
            const selectedOption = answer ? answer.selectedOption : -1;
            return {
                questionId: q._id,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                selectedOption,
                isCorrect: selectedOption === q.correctAnswer,
            };
        });

        res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                attemptId: attempt._id,
                score,
                total,
                percentage: attempt.percentage,
                result,
            },
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all attempts by the current user
// @route   GET /api/attempts/my
// @access  Private
const getMyAttempts = async (req, res, next) => {
    try {
        const attempts = await Attempt.find({ userId: req.user._id })
            .populate('quizId', 'title description')
            .sort({ attemptedAt: -1 });

        res.json({ success: true, count: attempts.length, data: attempts });
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single attempt by ID
// @route   GET /api/attempts/:id
// @access  Private
const getAttempt = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid attempt ID format' });
        }

        const attempt = await Attempt.findById(req.params.id)
            .populate('quizId')
            .populate('userId', 'name email');

        if (!attempt) {
            return res
                .status(404)
                .json({ success: false, message: 'Attempt not found' });
        }

        const isOwner = attempt.userId._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this attempt',
            });
        }

        res.json({ success: true, data: attempt });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all attempts (admin only)
// @route   GET /api/attempts
// @access  Private (admin)
const getAllAttempts = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const attempts = await Attempt.find()
            .populate('quizId', 'title')
            .populate('userId', 'name email')
            .sort({ attemptedAt: -1 });
        res.json({ success: true, count: attempts.length, data: attempts });
    } catch (err) {
        next(err);
    }
};

module.exports = { submitAttempt, getMyAttempts, getAttempt, getAllAttempts };
