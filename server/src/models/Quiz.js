const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Option text is required'],
        trim: true,
    },
});

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
    },
    options: {
        type: [optionSchema],
        validate: {
            validator: function (v) {
                return v && v.length >= 2;
            },
            message: 'Each question must have at least 2 options',
        },
    },
    correctAnswer: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: 0,
    },
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Quiz title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        questions: {
            type: [questionSchema],
            validate: {
                validator: function (v) {
                    return v && v.length >= 1;
                },
                message: 'Quiz must have at least 1 question',
            },
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        joinCode: {
            type: String,
            required: [true, 'Join code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            maxlength: 10,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
