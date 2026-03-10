# Online Quiz & Assessment Platform

A full-stack **MERN** application for creating, managing, and taking quizzes with automatic score calculation.

---

## 📁 Folder Structure

```
quiz/
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── quizController.js
│   │   │   └── attemptController.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT verification
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Quiz.js
│   │   │   └── Attempt.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── quizzes.js
│   │   │   └── attempts.js
│   │   └── index.js           # App entry point
│   ├── .env
│   └── package.json
│
└── client/                    # Frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── QuizListPage.jsx
    │   │   ├── CreateQuizPage.jsx
    │   │   ├── AttemptQuizPage.jsx
    │   │   └── ResultsPage.jsx
    │   ├── services/
    │   │   └── api.js          # Axios instance + API methods
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`)

### 1. Start the Backend

```powershell
cd d:\quiz\server
npm install       # if not already done
npm run dev
```

Server starts at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 2. Start the Frontend

```powershell
cd d:\quiz\client
npm install       # if not already done
npm run dev
```

App opens at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | 🔒 |

### Quizzes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/quizzes` | Get all quizzes | 🔒 |
| GET | `/api/quizzes/my` | My created quizzes | 🔒 |
| GET | `/api/quizzes/:id` | Single quiz | 🔒 |
| POST | `/api/quizzes` | Create quiz | 🔒 |
| DELETE | `/api/quizzes/:id` | Delete quiz (owner) | 🔒 |

### Attempts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/attempts/:quizId` | Submit attempt | 🔒 |
| GET | `/api/attempts/my` | My past attempts | 🔒 |
| GET | `/api/attempts/:id` | Single attempt | 🔒 |

---

## 📊 MongoDB Schema Examples

### User
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "<bcrypt_hash>",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Quiz
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge",
  "createdBy": "<userId>",
  "questions": [
    {
      "questionText": "What is `typeof null`?",
      "options": [
        { "text": "null" },
        { "text": "object" },
        { "text": "undefined" },
        { "text": "string" }
      ],
      "correctAnswer": 1
    }
  ]
}
```

### Attempt
```json
{
  "userId": "<userId>",
  "quizId": "<quizId>",
  "answers": [
    { "questionId": "<questionId>", "selectedOption": 1 }
  ],
  "score": 8,
  "total": 10,
  "percentage": 80,
  "attemptedAt": "2024-01-01T00:00:00Z"
}
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, token refresh
- 📝 **Create Quizzes** — Dynamic form with add/remove questions & options
- 🧠 **Attempt Quizzes** — Question navigator, progress bar, keyboard-friendly
- 🏆 **Auto Scoring** — Server-side score calculation with correct/incorrect reveal
- 📊 **Results History** — Per-attempt score breakdowns with retake links
- 🔍 **Search** — Filter quiz list instantly
- 🛡️ **Protected Routes** — JWT middleware on all API routes + React PrivateRoute
- 📱 **Responsive** — Works on mobile, tablet, and desktop
