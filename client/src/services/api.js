import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('quizToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 globally (token expired/invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/register')) {
            localStorage.removeItem('quizToken');
            localStorage.removeItem('quizUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    resendOtp: (data) => api.post('/auth/resend-otp', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
};

// Quizzes
export const quizAPI = {
    getAll: () => api.get('/quizzes'),
    getMy: () => api.get('/quizzes/my'),
    getById: (id, joinCode = '') => api.get(`/quizzes/${id}${joinCode ? `?joinCode=${joinCode}` : ''}`),
    joinQuiz: (code) => api.post('/quizzes/join', { code }),
    create: (data) => api.post('/quizzes', data),
    update: (id, data) => api.put(`/quizzes/${id}`, data),
    delete: (id) => api.delete(`/quizzes/${id}`),
    generateAI: (data) => api.post('/quizzes/generate', data),
    toggleActive: (id) => api.patch(`/quizzes/${id}/activate`),
};

// Attempts
export const attemptAPI = {
    submit: (quizId, data) => api.post(`/attempts/${quizId}`, data),
    getMy: () => api.get('/attempts/my'),
    getById: (id) => api.get(`/attempts/${id}`),
    getAll: () => api.get('/attempts'),
};

export default api;
