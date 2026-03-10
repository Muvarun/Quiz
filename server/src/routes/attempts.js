const express = require('express');
const { submitAttempt, getMyAttempts, getAttempt, getAllAttempts } = require('../controllers/attemptController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All attempt routes require authentication

router.get('/my', getMyAttempts);
router.get('/:id', getAttempt);
router.post('/:quizId', submitAttempt);

router.get('/', authorize('admin'), getAllAttempts);
module.exports = router;
