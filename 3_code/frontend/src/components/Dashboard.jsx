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
import FlashcardGenerator from './FlashcardGenerator';
import SyllabusScanner from './SyllabusScanner';
import SocialCampus from './SocialCampus';
import LectureVoiceNotes from './LectureVoiceNotes';
import HoldsCenter from './HoldsCenter';
import FinancialAidNexus from './FinancialAidNexus';
import CareerPathfinder from './CareerPathfinder';
import PrivacyPolicy from './legal/PrivacyPolicy';
import MSA from './legal/MSA';
import SLA from './legal/SLA';
import Footer from './Footer';
import FacultyDashboard from './FacultyDashboard';
import DegreeRoadmap from './DegreeRoadmap';
import Support from './Support';
import Subscription from './Subscription';


import {
    LayoutDashboard, MessageSquare, Calendar, BookOpen,
    TrendingUp, User, Settings, LogOut, Clock,
    Users, FileText, Heart, GraduationCap, ChevronRight, Edit3, Menu, X, Shield, History as HistoryIcon, Brain, ScanLine, Mic, ShieldAlert, AlertTriangle, Briefcase, Map, CreditCard
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
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>aumtech.ai</h2>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Student Navigator</span>
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
                    <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleProtectedTab('chat')}><MessageSquare size={20} /> AI Navigator</div>
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
                    <div className={`nav-item ${activeTab === 'holds' ? 'active' : ''}`} onClick={() => handleProtectedTab('holds')}><ShieldAlert size={20} /> Holds & Alerts</div>
                    <div className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => handleProtectedTab('subscription')}><CreditCard size={20} /> My Plan</div>

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
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Student Navigator</div>
                            </div>
                        </div>

                        {/* Legal Footer */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.65rem', color: '#94a3b8' }}>
                            <div style={{ marginBottom: '0.25rem' }}>© 2026 aumtech.ai | Navigator</div>
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
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.9 }}>
                        <Brain size={18} /> aumtech.ai Navigator
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0', fontWeight: '700' }}>
                        Good afternoon, {userData?.full_name ? userData.full_name.split(' ')[0] : 'Student'}!
                    </h1>
                    <p style={{ maxWidth: '500px', fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.6' }}>
                        {userData?.ai_insight || "Welcome to your Academic Success Navigator. I'm here to help you stay on track with your courses and goals."}
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

                {userData?.subscription_info?.status === 'trialing' && (
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'white', fontWeight: '600', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        Free Trial: {userData.subscription_info.days_left} days left
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-white" style={{ width: '450px', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Profile Settings</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Read-Only Identity Info */}
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Email Address</label>
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{userData?.email}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Student ID</label>
                                <div style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>#{userData?.id?.toString().padStart(6, '0')}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Joined</label>
                                <div style={{ fontSize: '0.95rem' }}>{userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />

                    {/* Editable Fields */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Current GPA</label>
                            <input type="number" step="0.1" max="4.0" value={gpa} onChange={(e) => setGpa(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e880' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>University Email</label>
                            <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }}>{userData?.email}</div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Major / Study Track</label>
                        <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Computer Science" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Personal Background (Heritage, Identity, Goals)</label>
                        <textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Helps with matching diversity scholarships..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', height: '80px', resize: 'none' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Research Interests / Skills</label>
                        <textarea value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Machine Learning, Renaissance Art, Sustainability..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', height: '60px', resize: 'none' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Default Notes Language</label>

                        <select
                            value={defaultLang}
                            onChange={(e) => setDefaultLang(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            {["English", "Spanish", "Mandarin Chinese", "Hindi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu"].map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
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
            setUserData(res.data);
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

                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#0f172a' }}>aumtech.ai Navigator</span>
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
                    {/* Responsive Padding adjustment */}
                    <style>{`
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
                                            chatMode === 'fafsa' ? 'AI FAFSA Expert' : 'AI Navigator'}
                            </h2>
                            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', minHeight: 0 }}>
                                <ChatInterface mode={chatMode} initialSessionId={chatSessionId} />
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

                    {activeTab !== 'chat' && <Footer onNavigate={(tab) => setActiveTab(tab)} />}
                </main>
            </div>

            {/* Modal can be triggered from anywhere */}
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
        </div>
    );
};

export default Dashboard;
