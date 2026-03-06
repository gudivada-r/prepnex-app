import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="login-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel"
                style={{ textAlign: 'center', padding: '4rem 3rem' }}
            >
                <div style={{ margin: '0 auto 1.5rem auto', color: '#f87171' }}>
                     <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                </div>
                
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    margin: '0',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1
                }}>404</h1>
                
                <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#e2e8f0' }}>Page Not Found</h2>
                
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <button 
                    onClick={() => navigate('/')} 
                    className="login-btn"
                    style={{ maxWidth: '200px', margin: '0 auto' }}
                >
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default NotFound;
