import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChatInterface from './ChatInterface';
import BookAdvisor from './BookAdvisor';
import TutoringCenter from './TutoringCenter';
import Courses from './Courses';
import WellnessCheck from './WellnessCheck';
import StudyTimer from './StudyTimer';
import TexasAnalytics from './TexasAnalytics';
import CIPExplorer from './CIPExplorer';
import DropAddForms from './DropAddForms';
import Progress from './Progress';
import History from './History';
import AdminPanel from './AdminPanel';
import AdminEdnex from './AdminEdnex';
import FlashcardGenerator from './FlashcardGenerator';
import SyllabusScanner from './SyllabusScanner';
import SocialCampus from './SocialCampus';
import LectureVoiceNotes from './LectureVoiceNotes';
import HoldsCenter from './HoldsCenter';
import FinancialAidNexus from './FinancialAidNexus';
import CareerPathfinder from './CareerPathfinder';
import CareerMapper from './CareerMapper';
import PrivacyPolicy from './legal/PrivacyPolicy';
import MSA from './legal/MSA';
import SLA from './legal/SLA';
import Footer from './Footer';
import FacultyDashboard from './FacultyDashboard';
import DegreeRoadmap from './DegreeRoadmap';
import Support from './Support';
import Subscription from './Subscription';
import QuoteGenerator from './QuoteGenerator';



import {
    LayoutDashboard, MessageSquare, Calendar, BookOpen,
    TrendingUp, User, Settings, LogOut, Clock,
    Users, FileText, Heart, GraduationCap, ChevronRight, Edit3, Menu, X, Shield, History as HistoryIcon, Brain, ScanLine, Mic, ShieldAlert, AlertTriangle, Briefcase, Map, CreditCard, Database, Calculator
} from 'lucide-react';

import { motion } from 'framer-motion';
import logoAsset from '../assets/logo.png';




const Sidebar = ({ activeTab, onTabChange, userData, isOpen, onClose }) => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
    const handleLogin = () => { navigate('/login'); };

    const handleProtectedTab = (tab) => {
        const publicTabs = ['dashboard', 'courses', 'wellness', 'social'];
        if (!isLoggedIn && !publicTabs.includes(tab)) {
            // If trying to access a private tab (like 'settings' or 'chat') without login -> redirect
            navigate('/login');
        } else {
            onTabChange(tab);
            if (window.innerWidth <= 768) {
                onClose();
            }
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            ></div>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo & Close Button */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
                    <div style={{ padding: '0px', borderRadius: '10px' }}>
                        <img src={logoAsset} alt="Logo" style={{ width: '200px', height: 'auto', borderRadius: '12px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }} />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>Aura</h2>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Intelligent Academic Platform</span>
                    </div>

                    {/* Mobile Close Button */}
                    <button className="mobile-only" onClick={onClose} style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Nav Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                    {/* ... existing dynamic nav items ... */}
                    {/* MAIN NAVIGATION */}
                    <div className="section-title">Home</div>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleProtectedTab('dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
                    <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleProtectedTab('chat')}><MessageSquare size={20} /> Get Aura</div>
                    <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleProtectedTab('analytics')}><TrendingUp size={20} /> Institutional Research</div>

                    <div className="section-title">Academics</div>
                    <div className={`nav-item ${activeTab === 'degree-roadmap' ? 'active' : ''}`} onClick={() => handleProtectedTab('degree-roadmap')}><Map size={20} /> Degree Roadmap</div>
                    <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => handleProtectedTab('courses')}><BookOpen size={20} /> Courses</div>
                    <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => handleProtectedTab('schedule')}><Calendar size={20} /> Schedule</div>
                    <div className={`nav-item ${activeTab === 'syllabus' ? 'active' : ''}`} onClick={() => handleProtectedTab('syllabus')}><ScanLine size={20} /> Syllabus Scanner</div>
                    <div className={`nav-item ${activeTab === 'cip' ? 'active' : ''}`} onClick={() => handleProtectedTab('cip')}><BookOpen size={20} /> CIP Codes</div>
                    <div className={`nav-item ${activeTab === 'voice-notes' ? 'active' : ''}`} onClick={() => handleProtectedTab('voice-notes')}><Mic size={20} /> Lecture Notes</div>

                    <div className="section-title">My Records</div>
                    <div className={`nav-item ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => handleProtectedTab('forms')}><FileText size={20} /> Drop/Add Forms</div>
                    <div className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => handleProtectedTab('progress')}><TrendingUp size={20} /> Progress</div>
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleProtectedTab('history')}><HistoryIcon size={20} /> My History</div>

                    <div className="section-title">Tools & Support</div>
                    <div className={`nav-item ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => handleProtectedTab('timer')}><Clock size={20} /> Study Timer</div>
                    <div className={`nav-item ${activeTab === 'smart-study' ? 'active' : ''}`} onClick={() => handleProtectedTab('smart-study')}><Brain size={20} /> Flashcards</div>
                    <div className={`nav-item ${activeTab === 'tutoring' ? 'active' : ''}`} onClick={() => handleProtectedTab('tutoring')}><GraduationCap size={20} /> Tutoring Center</div>
                    <div className={`nav-item ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => handleProtectedTab('financial')}><GraduationCap size={20} /> Financial Nexus</div>
                    <div className={`nav-item ${activeTab === 'career' ? 'active' : ''}`} onClick={() => handleProtectedTab('career')}><Briefcase size={20} /> Career Pathfinder</div>
                    <div className={`nav-item ${activeTab === 'ednex' ? 'active' : ''}`} onClick={() => handleProtectedTab('ednex')}><Briefcase size={20} /> Project EdNex</div>
                    <div className={`nav-item ${activeTab === 'holds' ? 'active' : ''}`} onClick={() => handleProtectedTab('holds')}><ShieldAlert size={20} /> Holds & Alerts</div>
                    <div className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => handleProtectedTab('subscription')}><Shield size={20} /> Institutional Access</div>

                    <div className="section-title">Campus Life</div>
                    <div className={`nav-item ${activeTab === 'social' ? 'active' : ''}`} onClick={() => handleProtectedTab('social')}><Users size={20} /> Social Campus</div>
                    <div className={`nav-item ${activeTab === 'wellness' ? 'active' : ''}`} onClick={() => handleProtectedTab('wellness')}><Heart size={20} /> Wellness</div>

                    {(userData?.is_faculty || userData?.is_admin) && (
                        <>
                            <div className="section-title">Faculty & Staff</div>
                            <div className={`nav-item ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => handleProtectedTab('faculty')}><Users size={20} /> Faculty Portal</div>
                        </>
                    )}

                    {userData?.is_admin && (
                        <>
                            <div className="section-title">Admin</div>
                            <div className={`nav-item ${activeTab === 'adminPanel' ? 'active' : ''}`} onClick={() => handleProtectedTab('adminPanel')}><Shield size={20} /> Admin Panel</div>
                            <div className={`nav-item ${activeTab === 'adminEdnex' ? 'active' : ''}`} onClick={() => handleProtectedTab('adminEdnex')}><Database size={20} /> EdNex Config</div>
                            <div className={`nav-item ${activeTab === 'quoteGen' ? 'active' : ''}`} onClick={() => handleProtectedTab('quoteGen')}><Calculator size={20} /> Quote Generator</div>
                        </>
                    )}

                    {/* Bottom Config */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <div className="nav-item" onClick={() => handleProtectedTab('edit-profile')}><Settings size={20} /> Settings</div>
                        {isLoggedIn ? (
                            <div onClick={handleLogout} className="nav-item" style={{ color: '#ef4444' }}>
                                <LogOut size={20} /> Logout
                            </div>
                        ) : (
                            <div onClick={handleLogin} className="nav-item" style={{ color: '#4f46e5' }}>
                                <User size={20} /> Login / Sign Up
                            </div>
                        )}

                        {/* User Profile Micro */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {userData?.full_name ? userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'S'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {userData?.full_name || 'Student'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Aura</div>
                            </div>
                        </div>

                        {/* Legal Footer */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.65rem', color: '#94a3b8' }}>
                            <div style={{ marginBottom: '0.25rem' }}>© 2026 Aura | Academic Intelligence</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <span onClick={() => handleProtectedTab('privacy')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>Privacy</span>
                                <span onClick={() => handleProtectedTab('msa')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>MSA</span>
                                <span onClick={() => handleProtectedTab('sla')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>SLA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


const DashboardHome = ({ onNavigate, userData, onEditStats }) => {
    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '0 1rem' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-card"
                style={{ position: 'relative' }}
            >
                {/* EdNex Verified Badge */}
                {userData?.is_ednex_verified && (
                    <div className="ednex-neon" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', color: 'white' }}>
                        <Shield size={14} /> EdNex Verified
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.9 }}>
                        <Brain size={18} /> Aura Intelligence Engine
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0', fontWeight: '700' }}>
                        Good afternoon, {userData?.full_name ? userData.full_name.split(' ')[0] : 'Student'}!
                    </h1>
                    <p style={{ maxWidth: '500px', fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.6' }}>
                        {userData?.ai_insight || "Welcome to Aura. Your personal academic intelligence platform designed to help you succeed."}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={() => onNavigate('chat')} style={{ border: 'none', background: 'white', color: '#4f46e5', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Chat with AI</button>
                        <button style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View schedule</button>
                    </div>
                </div>

                <div className="stats-container">
                    <div className="edit-btn-wrapper">
                        <button
                            onClick={onEditStats}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>
                    <div className="stat-card-glass">
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{userData?.gpa?.toFixed(1) || '0.0'}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Current GPA</div>
                    </div>
                    <div className="stat-card-glass">
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{userData?.on_track_score || '0'}%</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>On-track score</div>
                    </div>
                </div>

                {userData?.is_ednex_verified && (
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'white', fontWeight: '600', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        Institutional License Active
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <h3 className="section-title">Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                    { icon: ShieldAlert, color: '#ef4444', label: 'Holds & Alerts', sub: 'Action required', action: 'holds' },
                    { icon: Calendar, color: '#6366f1', label: 'Book Advisor', sub: 'Schedule a meeting', action: 'schedule' },
                    { icon: BookOpen, color: '#10b981', label: 'Tutoring Center', sub: 'Get study help', action: 'tutoring' },
                    { icon: FileText, color: '#f59e0b', label: 'Drop/Add Forms', sub: 'Deadline: Oct 15', action: 'forms' },
                    { icon: Clock, color: '#eab308', label: 'Study Timer', sub: 'Stay focused', action: 'timer' },
                    { icon: Mic, color: '#4f46e5', label: 'Voice Notes', sub: 'Transcribe lectures', action: 'voice-notes' },
                    { icon: Briefcase, color: '#ec4899', label: 'Career Finder', sub: 'Find internships', action: 'career' },
                ].map((item, idx) => (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={idx}
                        className="card-white"
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => item.action && onNavigate(item.action)}
                    >
                        <div style={{ background: `${item.color}15`, width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                            <item.icon color={item.color} size={24} />
                        </div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* AI Team */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Your AI Support Team</h3>
                <button className="pill-btn" onClick={() => onNavigate('chat')} style={{ cursor: 'pointer', background: 'white', border: '1px solid #e2e8f0' }}>Open Chat <ChevronRight size={16} style={{ verticalAlign: 'middle' }} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingBottom: '2rem' }}>
                {[
                    { title: "The Tutor", mode: "tutor", role: "Course content specialist", color: "#4f46e5", icon: GraduationCap, tags: ["Explain photosynthesis", "Help with calculus", "Review my essay"] },
                    { title: "The Admin", mode: "admin", role: "Forms & deadlines expert", color: "#10b981", icon: FileText, tags: ["Drop deadline?", "Add a course", "Transcript request"] },
                    { title: "The Coach", mode: "coach", role: "Wellness & support guide", color: "#ec4899", icon: Heart, tags: ["Feeling stressed", "Find a club", "Mental health resouces"] },
                ].map((agent, idx) => (
                    <motion.div key={idx} className="card-white" style={{ cursor: 'pointer' }} onClick={() => onNavigate('chat', agent.mode)}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ background: agent.color, padding: '12px', borderRadius: '12px', color: 'white' }}>
                                <agent.icon size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{agent.title}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{agent.role}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Try asking:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {agent.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="pill-btn">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const EditProfileModal = ({ userData, onClose, onRefresh }) => {
    const [fullName, setFullName] = useState(userData?.full_name || '');
    const [gpa, setGpa] = useState(userData?.gpa || 0.0);
    const [_onTrackScore, _setOnTrackScore] = useState(userData?.on_track_score || 0);

    const [major, setMajor] = useState(userData?.major || '');
    const [background, setBackground] = useState(userData?.background || '');
    const [interests, setInterests] = useState(userData?.interests || '');
    const [defaultLang, setDefaultLang] = useState(localStorage.getItem('defaultLanguage') || 'English');


    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/users/me', {
                full_name: fullName,
                gpa: parseFloat(gpa),
                on_track_score: parseInt(_onTrackScore),

                major,
                background,
                interests
            });
            localStorage.setItem('defaultLanguage', defaultLang);

            onRefresh();
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile");
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="card-white"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2.5rem',
                    borderRadius: '24px',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Profile Settings</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Section 1: Institutional Identity */}
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>University Email</label>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{userData?.email}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Student ID</label>
                                <div style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#4f46e5', fontWeight: '700' }}>#{userData?.id?.toString().padStart(6, '0')}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Joined Platform</label>
                                <div style={{ fontSize: '1rem', color: '#1e293b' }}>{userData?.created_at ? new Date(userData.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Personal & Academic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', transition: 'border-color 0.2s' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Major / Study Track</label>
                            <input
                                type="text"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                placeholder="e.g. Computer Science"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Current GPA</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4.0"
                                    value={gpa}
                                    onChange={(e) => setGpa(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem' }}
                                />
                                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>/ 4.0</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Background & AI Context */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Personal Background (Heritage, Identity, Goals)</label>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Helps Aura match you with diversity scholarships and relevant student orgs.</p>
                        <textarea
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            placeholder="Tell us about yourself..."
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', height: '120px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Research Interests / Skills</label>
                        <textarea
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            placeholder="e.g. Machine Learning, Renaissance Art, Sustainability..."
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', height: '100px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>Preferred Language for Notes</label>
                            <select
                                value={defaultLang}
                                onChange={(e) => setDefaultLang(e.target.value)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', background: 'white' }}
                            >
                                {["English", "Spanish", "Mandarin Chinese", "Hindi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu"].map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f0f9ff', padding: '1.25rem', borderRadius: '16px', border: '2px solid #bae6fd' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: '#0369a1', fontSize: '1rem' }}>AI SMS Nudges</div>
                                <div style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>Get proactive academic alerts via SMS.</div>
                            </div>
                            <div style={{
                                width: '50px',
                                height: '26px',
                                background: '#0284c7',
                                borderRadius: '20px',
                                position: 'relative',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '3px'
                            }}>
                                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', marginLeft: 'auto' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '16px',
                                fontWeight: '700',
                                color: '#64748b',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 2,
                                padding: '1.25rem',
                                background: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Save Profile Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};



const Dashboard = () => {

    const [activeTab, setActiveTab] = useState('dashboard');
    const [chatMode, setChatMode] = useState(null); // 'tutor', 'admin', 'coach', or null
    const [chatSessionId, setChatSessionId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [holds, setHolds] = useState([]);
    const [prefilledData, setPrefilledData] = useState(null);
    const navigate = useNavigate();

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await api.get('/api/users/me');
            let baseUser = res.data;

            try {
                // Fetch Enterprise Context from EdNex
                const edNexRes = await api.get('/api/ednex/context');

                if (edNexRes.data?.status === 'success' && edNexRes.data.context) {
                    const ctx = edNexRes.data.context;
                    baseUser.is_ednex_verified = true;

                    if (ctx.student_profile?.name) baseUser.full_name = ctx.student_profile.name;

                    if (ctx.sis_stream?.cumulative_gpa !== undefined) {
                        baseUser.gpa = parseFloat(ctx.sis_stream.cumulative_gpa);
                    }
                    if (ctx.finance_stream?.tuition_balance !== undefined) {
                        baseUser.tuition_balance = parseFloat(ctx.finance_stream.tuition_balance);
                        baseUser.has_financial_hold = ctx.finance_stream.has_financial_hold;
                    }

                    // Simple heuristic for on_track_score based on enterprise data
                    if (baseUser.gpa) {
                        baseUser.on_track_score = Math.min(100, Math.round((baseUser.gpa / 4.0) * 100));
                    }

                    // Persist EdNex-enriched GPA back to the DB so it survives page reloads
                    if (baseUser.gpa) {
                        api.put('/api/users/me', {
                            gpa: baseUser.gpa,
                            on_track_score: baseUser.on_track_score
                        }).catch(err => console.log("GPA persist failed:", err));
                    }
                }
            } catch (err) {
                console.log("EdNex sync unavailable:", err);
            }

            setUserData(baseUser);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setUserData(null);
            }
        }
    };

    const fetchHolds = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/api/holds');
            setHolds(res.data);
        } catch (error) {
            console.error("Failed to fetch holds:", error);
        }
    };

    const handleFeatureNavigate = (tab, mode = null, sessionId = null, data = null) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setActiveTab(tab);
            setChatMode(mode);
            setChatSessionId(sessionId);
            setPrefilledData(data);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchHolds();

        const query = new URLSearchParams(window.location.search);
        if (query.get('payment') === 'success') {
            // In a real app, use a nicer toast
            setActiveTab('subscription');
        }

        const handleSubRequired = () => {
            setActiveTab('subscription');
        };
        window.addEventListener('subscription-required', handleSubRequired);
        return () => window.removeEventListener('subscription-required', handleSubRequired);
    }, []);


    return (
        <div style={{ display: 'flex', height: '100dvh', background: '#f8fafc', flexDirection: 'column' }}>
            {/* Mobile Header - Fixed App Bar */}
            <div className="mobile-only" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: 'calc(2rem + env(safe-area-inset-top)) 1rem 0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 50,
                height: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '4px', borderRadius: '8px', marginRight: '8px' }}>
                        <img src={logoAsset} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                    </div>

                    <span style={{ fontWeight: '700', fontSize: '1.5rem', color: '#0f172a' }}>Aura</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}>
                    <Menu size={24} />
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={(t) => handleFeatureNavigate(t, null)}
                    userData={userData}
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                <main
                    style={{
                        flex: 1,
                        padding: activeTab === 'chat' ? 0 : '2rem 3rem',
                        overflowY: activeTab === 'chat' ? 'hidden' : 'auto',
                        overflowX: 'hidden', // Force kill horizontal scroll
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    className="main-content"
                >
                    {/* Responsive Padding adjustment & Neon Effects */}
                    <style>{`
                        @keyframes neon-glow {
                            0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4), 0 0 10px rgba(16, 185, 129, 0.2); text-shadow: 0 0 2px rgba(255,255,255,0.5); border-color: rgba(16, 185, 129, 0.5); }
                            50% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4); text-shadow: 0 0 5px rgba(255,255,255,1), 0 0 10px #10b981; border-color: #10b981; }
                            100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4), 0 0 10px rgba(16, 185, 129, 0.2); text-shadow: 0 0 2px rgba(255,255,255,0.5); border-color: rgba(16, 185, 129, 0.5); }
                        }
                        .ednex-neon {
                            animation: neon-glow 1.5s infinite;
                            border: 1px solid #10b981;
                            background: rgba(16, 185, 129, 0.15);
                            backdrop-filter: blur(10px);
                        }

                        @media (max-width: 768px) {
                            .main-content {
                            padding: ${activeTab === 'chat' ? 0 : '1rem'} !important;
                        padding-top: calc(8.5rem + env(safe-area-inset-top)) !important;
                            }

                        /* Force Stats Grid Side-by-Side */
                        .stats-container {
                            display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        width: 100% !important;
                        gap: 1rem !important;
                            }
                        .edit-btn-wrapper {
                            grid-column: 1 / -1 !important;
                        justify-content: center !important;
                        margin-bottom: 0.5rem !important;
                            }
                        .stat-card-glass {
                            margin-bottom: 0 !important;
                        width: 100% !important;
                            }
                        }
                    `}</style>

                    {activeTab === 'dashboard' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {holds.some(h => h.status === 'active') && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setActiveTab('holds')}
                                    style={{
                                        background: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <AlertTriangle color="#ef4444" size={20} />
                                        <span style={{ color: '#991b1b', fontWeight: '700' }}>
                                            You have {holds.filter(h => h.status === 'active').length} active hold(s) or alert(s) that require your attention.
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: '700', fontSize: '0.9rem' }}>
                                        View Details <ChevronRight size={16} />
                                    </div>
                                </motion.div>
                            )}
                            <DashboardHome onNavigate={handleFeatureNavigate} userData={userData} onEditStats={() => handleFeatureNavigate('edit-profile')} />
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                            <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>
                                {chatMode === 'tutor' ? 'The Tutor' :
                                    chatMode === 'admin' ? 'The Admin' :
                                        chatMode === 'coach' ? 'The Coach' :
                                            chatMode === 'fafsa' ? 'AI FAFSA Expert' : 'Get Aura'}
                            </h2>
                            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', minHeight: 0 }}>
                                <ChatInterface mode={chatMode} initialSessionId={chatSessionId} prefilledData={prefilledData} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && <TexasAnalytics />}

                    {activeTab === 'cip' && <CIPExplorer />}

                    {activeTab === 'history' && <History onSelectSession={(id) => handleFeatureNavigate('chat', null, id)} />}

                    {activeTab === 'schedule' && <BookAdvisor onBack={() => setActiveTab('dashboard')} />}

                    {activeTab === 'courses' && <Courses />}

                    {activeTab === 'tutoring' && <TutoringCenter />}

                    {activeTab === 'wellness' && <WellnessCheck />}

                    {activeTab === 'timer' && <StudyTimer onBack={() => setActiveTab('dashboard')} />}

                    {activeTab === 'smart-study' && <FlashcardGenerator prefilledData={prefilledData} />}

                    {activeTab === 'voice-notes' && <LectureVoiceNotes onNavigate={handleFeatureNavigate} />}

                    {activeTab === 'syllabus' && <SyllabusScanner />}

                    {activeTab === 'holds' && <HoldsCenter />}

                    {activeTab === 'financial' && <FinancialAidNexus onNavigate={handleFeatureNavigate} />}

                    {activeTab === 'career' && <CareerPathfinder />}
                    {activeTab === 'ednex' && <CareerMapper />}

                    {activeTab === 'forms' && <DropAddForms onBack={() => setActiveTab('dashboard')} />}


                    {activeTab === 'progress' && <Progress />}

                    {/* Legal Pages */}
                    {activeTab === 'privacy' && <PrivacyPolicy onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'msa' && <MSA onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'sla' && <SLA onBack={() => setActiveTab('dashboard')} />}

                    {/* Social Campus */}
                    {activeTab === 'social' && <SocialCampus />}

                    {/* Faculty */}
                    {activeTab === 'faculty' && <FacultyDashboard />}

                    {/* Admin */}
                    {/* Main Features */}
                    {activeTab === 'degree-roadmap' && <DegreeRoadmap />}
                    {activeTab === 'support' && <Support onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'subscription' && <Subscription userData={userData} onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'adminPanel' && userData?.is_admin && <AdminPanel />}
                    {activeTab === 'adminEdnex' && userData?.is_admin && <AdminEdnex />}
                    {activeTab === 'quoteGen' && userData?.is_admin && <QuoteGenerator />}

                    {activeTab !== 'chat' && <Footer onNavigate={(tab) => setActiveTab(tab)} />}
                </main>
            </div>

            {(isEditModalOpen || activeTab === 'edit-profile') && (
                <EditProfileModal
                    userData={userData}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        if (activeTab === 'edit-profile') setActiveTab('dashboard');
                    }}
                    onRefresh={fetchUser}
                />
            )}

            {/* Feature 1: The Panic Button (Instant Hand Raise) */}
            {activeTab !== 'chat' && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFeatureNavigate('chat', 'coach', null, { message: 'I need help immediately.' })}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.5), 0 8px 10px -6px rgba(239, 68, 68, 0.5)',
                        cursor: 'pointer',
                        fontWeight: '800',
                        fontSize: '1rem',
                        zIndex: 1000
                    }}
                >
                    <AlertTriangle size={20} />
                    I Need Help Now
                </motion.button>
            )}
        </div>
    );
};

export default Dashboard;
