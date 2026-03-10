import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if token exists
    useEffect(() => {
        const token = localStorage.getItem('quizToken');
        const storedUser = localStorage.getItem('quizUser');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setLoading(false);
                return; // Done if we have both
            } catch (e) {
                localStorage.removeItem('quizUser');
            }
        }

        if (token) {
            // fetch user profile if token exists but user data doesn't
            import('../services/api').then(({ authAPI }) => {
                authAPI.getMe()
                    .then((res) => {
                        setUser(res.data.user);
                        localStorage.setItem('quizUser', JSON.stringify(res.data.user));
                    })
                    .catch(() => {
                        localStorage.removeItem('quizToken');
                        localStorage.removeItem('quizUser');
                    })
                    .finally(() => setLoading(false));
            });
        } else {
            setLoading(false);
        }
    }, []);

    const register = (token, userData) => {
        localStorage.setItem('quizToken', token);
        localStorage.setItem('quizUser', JSON.stringify(userData));
        setUser(userData);
    };

    const login = (token, userData) => {
        localStorage.setItem('quizToken', token);
        localStorage.setItem('quizUser', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('quizToken');
        localStorage.removeItem('quizUser');
        setUser(null);
        navigate('/login');
    };

    const authAxios = axios.create();
    authAxios.interceptors.request.use((config) => {
        const token = localStorage.getItem('quizToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, register, login, logout, authAxios }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
