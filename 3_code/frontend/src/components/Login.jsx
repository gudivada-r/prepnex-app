import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import logoAsset from '../assets/logo.png';


import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/google', {
                credential: credentialResponse.credential
            });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const payload = isRegistering
            ? { email, password_hash: password, full_name: fullName }
            : new URLSearchParams({ username: email, password: password });

        setLoading(true);
        try {
            const config = isRegistering ? {} : { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
            const response = await api.post(endpoint, payload, config);

            if (!isRegistering) {
                localStorage.setItem('token', response.data.access_token);
                navigate('/dashboard');
            } else {
                alert("Registration successful! Please login.");
                setIsRegistering(false);
            }
        } catch (error) {
            console.error("Login Error:", error);
            const status = error.response ? error.response.status : "Unknown";
            const url = error.config ? error.config.url : "Unknown";
            const detail = typeof error.response?.data?.detail === 'string'
                ? error.response?.data?.detail
                : JSON.stringify(error.response?.data?.detail) || error.message;

            // Self-Healing Logic for Schema Errors
            if (detail && (detail.includes("UndefinedColumn") || detail.includes("is_active"))) {
                try {
                    // Attempt to fix the schema
                    await api.get('/api/fix_db_schema');
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a sec

                    // Retry Login *once*
                    const retryResponse = await api.post(endpoint, payload, config);
                    if (!isRegistering) {
                        localStorage.setItem('token', retryResponse.data.access_token);
                        navigate('/dashboard');
                        return; // Exit success
                    }
                } catch (repairError) {
                    console.error("Auto-repair failed:", repairError);
                    alert(`Authentication failed and auto-repair failed!\nError: ${detail}`);
                }
            } else {
                const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
                alert(`Authentication failed!
Status: ${status}
Full URL: ${fullUrl}
App Origin: ${window.location.origin}
App Host: ${window.location.hostname}
Error: ${detail}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Left side – hero illustration and tagline */}
            <div className="login-hero">
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>aumtech.ai | Student Success AI</h1>
                <h2 style={{ color: '#a5b4fc', fontSize: '1.5rem', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
                    Powered by AI Agents
                </h2>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', opacity: 0.9 }}>
                    Your personal AI‑powered academic companion –
                    <br />
                    track grades, book tutoring, check‑in on wellness, and get instant AI advice.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        Real‑time GPA & course tracker
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        AI chat for instant academic help
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        Wellness check‑ins & personalized resources
                    </li>
                </ul>
            </div>

            {/* Right side – glass‑morphism login form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel"
            >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <img src={logoAsset} alt="Logo" style={{ width: '280px', filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4))', borderRadius: '12px' }} />
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {isRegistering ? 'Create your account' : 'Sign in'}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                        {isRegistering ? 'Join the community' : 'Welcome back!'}
                    </p>
                </div>
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {isRegistering && (
                        <div>
                            <label htmlFor="fullName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Alex Johnson"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={isRegistering}
                                autoComplete="name"
                                className="login-input"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>University Email</label>
                        <input
                            id="email"
                            name="username"
                            type="email"
                            placeholder="student@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="login-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isRegistering ? "new-password" : "current-password"}
                            className="login-input"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.log('Login Failed');
                                alert("Google Login Failed");
                            }}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            width="100%"
                        />
                    </div>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? (
                            <span>Already have an account? <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign in</span></span>
                        ) : (
                            <span>Don't have an account? <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign up</span></span>
                        )}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
