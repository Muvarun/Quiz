import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to="/dashboard" className="navbar-brand">
                    ⚡ QuizMaster
                </NavLink>
                {user && (
                    <div className="navbar-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            Dashboard
                        </NavLink>
                        {user.role === 'admin' && (
                            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Admin Dash
                            </NavLink>
                        )}
                        <NavLink to="/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            Browse Quizzes
                        </NavLink>
                        {user.role === 'admin' ? (
                            <>
                                <NavLink to="/quizzes/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    + Create Quiz
                                </NavLink>
                                <NavLink to="/results/all" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    All Results
                                </NavLink>
                            </>
                        ) : (
                            <NavLink to="/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                My Results
                            </NavLink>
                        )}
                        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 8px' }}>
                            👤 {user.name}
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
