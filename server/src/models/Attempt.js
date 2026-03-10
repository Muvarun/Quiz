const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    selectedOption: {
        type: Number,
        required: true,
        min: 0,
    },
});

const attemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        answers: [answerSchema],
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Calculate percentage before saving
attemptSchema.pre('save', function (next) {
    if (this.total > 0) {
        this.percentage = Math.round((this.score / this.total) * 100);
    } else {
        this.percentage = 0;
    }
    next();
});

module.exports = mongoose.model('Attempt', attemptSchema);
