import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Default user dash
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QuizListPage from './pages/QuizListPage';
import CreateQuizPage from './pages/CreateQuizPage';
import AttemptQuizPage from './pages/AttemptQuizPage';
import ResultsPage from './pages/ResultsPage'; // User results
import AdminResultsPage from './pages/AdminResultsPage'; // All results
import AttemptDetailsPage from './pages/AttemptDetailsPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboardPage /></PrivateRoute>} />
          <Route path="/results/all" element={<PrivateRoute adminOnly={true}><AdminResultsPage /></PrivateRoute>} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/quizzes" element={<PrivateRoute><QuizListPage /></PrivateRoute>} />
          <Route path="/quizzes/create" element={<PrivateRoute adminOnly={true}><CreateQuizPage /></PrivateRoute>} />
          <Route path="/quizzes/:id/attempt" element={<PrivateRoute><AttemptQuizPage /></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
