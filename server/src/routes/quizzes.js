const express = require('express');
const { body } = require('express-validator');
const {
    getQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getMyQuizzes,
    generateAIQuiz,
    toggleQuizStatus,
    joinQuizByCode,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const quizValidation = [
    body('title').trim().notEmpty().withMessage('Quiz title is required'),
    body('questions').isArray({ min: 1 }).withMessage('Quiz must have at least 1 question'),
    body('questions.*.questionText').notEmpty().withMessage('Question text is required'),
    body('questions.*.options').isArray({ min: 2 }).withMessage('Each question must have at least 2 options'),
    body('questions.*.correctAnswer').isInt({ min: 0 }).withMessage('Correct answer index must be a non-negative integer'),
];

router.use(protect); // All quiz routes require authentication

router.get('/my', getMyQuizzes);
router.get('/', getQuizzes);
router.post('/join', joinQuizByCode);
router.get('/:id', getQuiz);
router.post('/generate', generateAIQuiz);
router.post('/', authorize('admin'), quizValidation, createQuiz);
router.put('/:id', authorize('admin'), updateQuiz);
router.delete('/:id', authorize('admin'), deleteQuiz);
router.patch('/:id/activate', authorize('admin'), toggleQuizStatus);

module.exports = router;
