import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChatInterface from './ChatInterface';
import BookAdvisor from './BookAdvisor';
import TutoringCenter from './TutoringCenter';
import Courses from './Courses';
import WellnessCheck from './WellnessCheck';
import StudyTimer from './StudyTimer';
import DropAddForms from './DropAddForms';
import Progress from './Progress';
import History from './History';
import AdminPanel from './AdminPanel';
import FlashcardGenerator from './FlashcardGenerator';
import SyllabusScanner from './SyllabusScanner';
import SocialCampus from './SocialCampus';
import LectureVoiceNotes from './LectureVoiceNotes';
import {
    LayoutDashboard, MessageSquare, Calendar, BookOpen,
    TrendingUp, User, Settings, LogOut, Search, Clock,
    Users, FileText, Heart, GraduationCap, ChevronRight, Edit3, Menu, X, Shield, History as HistoryIcon, Brain, ScanLine, Mic
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, onTabChange, userData, isOpen, onClose }) => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
    const handleLogin = () => { navigate('/login'); };

    const handleProtectedTab = (tab) => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            onTabChange(tab);
            if (window.innerWidth <= 768) {
                onClose(); // Close sidebar on mobile after selection
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '4px', borderRadius: '10px' }}>
                            <img src="/icon.svg" alt="Logo" style={{ width: '32px', height: '32px' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Navigator</h2>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Student Success</span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button className="mobile-only" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Nav Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                    {/* ... existing dynamic nav items ... */}
                    {['dashboard', 'chat', 'history', 'schedule', 'courses', 'timer', 'smart-study', 'voice-notes', 'syllabus', 'social', 'forms', 'progress', 'tutoring', 'wellness', 'adminPanel'].map(key => (
                        <div
                            key={key}
                            className={`nav-item ${activeTab === key ? 'active' : ''}`}
                            onClick={() => handleProtectedTab(key)}
                        >
                            {key === 'dashboard' && <><LayoutDashboard size={20} /> Dashboard</>}
                            {key === 'chat' && <><MessageSquare size={20} /> AI Navigator</>}
                            {key === 'history' && <><HistoryIcon size={20} /> My History</>}
                            {key === 'schedule' && <><Calendar size={20} /> Schedule</>}
                            {key === 'courses' && <><BookOpen size={20} /> Courses</>}
                            {key === 'timer' && <><Clock size={20} /> Study Timer</>}
                            {key === 'smart-study' && <><Brain size={20} /> Smart Study</>}
                            {key === 'voice-notes' && <><Mic size={20} /> Lecture Notes</>}
                            {key === 'syllabus' && <><ScanLine size={20} /> Syllabus Scanner</>}
                            {key === 'social' && <><Users size={20} /> Social Campus</>}
                            {key === 'forms' && <><FileText size={20} /> Drop/Add Forms</>}
                            {key === 'progress' && <><TrendingUp size={20} /> Progress</>}
                            {key === 'tutoring' && <><GraduationCap size={20} /> Tutoring</>}
                            {key === 'wellness' && <><Heart size={20} /> Wellness</>}
                            {key === 'adminPanel' && userData?.is_admin && <><Shield size={20} /> Admin Panel</>}
                        </div>
                    ))}
                </div>

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
                        <div style={{ marginBottom: '0.25rem' }}>© 2025 Student Success</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span onClick={() => handleProtectedTab('privacy')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>Privacy</span>
                            <span onClick={() => handleProtectedTab('msa')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>MSA</span>
                            <span onClick={() => handleProtectedTab('sla')} style={{ cursor: 'pointer', textDecoration: 'none', hover: { textDecoration: 'underline' } }}>SLA</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


const DashboardHome = ({ onNavigate, userData, onEditStats }) => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-card"
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.9 }}>
                        <GraduationCap size={18} /> Your Academic Success Navigator
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0', fontWeight: '700' }}>
                        Good afternoon, {userData?.full_name ? userData.full_name.split(' ')[0] : 'Student'}!
                    </h1>
                    <p style={{ maxWidth: '500px', fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.6' }}>
                        {userData?.ai_insight || "Welcome to your Academic Success Navigator. I'm here to help you stay on track with your courses and goals."}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => onNavigate('chat')} style={{ border: 'none', background: 'white', color: '#4f46e5', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Start a conversation</button>
                        <button style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View schedule</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
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
            </motion.div>

            {/* Quick Actions */}
            <h3 className="section-title">Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {[
                    { icon: Calendar, color: '#6366f1', label: 'Book Advisor', sub: 'Schedule a meeting', action: 'schedule' },
                    { icon: BookOpen, color: '#10b981', label: 'Tutoring Center', sub: 'Get study help', action: 'tutoring' },
                    { icon: FileText, color: '#f59e0b', label: 'Drop/Add Forms', sub: 'Deadline: Oct 15', action: 'forms' },
                    { icon: Heart, color: '#ec4899', label: 'Wellness Check', sub: 'How are you feeling?', action: 'wellness' },
                    { icon: Clock, color: '#eab308', label: 'Study Timer', sub: 'Stay focused', action: 'timer' },
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingBottom: '2rem' }}>
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
    const [onTrackScore, setOnTrackScore] = useState(userData?.on_track_score || 0);
    const [defaultLang, setDefaultLang] = useState(localStorage.getItem('defaultLanguage') || 'English');

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/users/me', {
                full_name: fullName,
                gpa: parseFloat(gpa),
                on_track_score: parseInt(onTrackScore)
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
                            <input type="number" step="0.1" max="4.0" value={gpa} onChange={(e) => setGpa(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>On-track Score (%)</label>
                            <input type="number" value={onTrackScore} onChange={(e) => setOnTrackScore(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
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

import PrivacyPolicy from './legal/PrivacyPolicy';
import MSA from './legal/MSA';
import SLA from './legal/SLA';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [chatMode, setChatMode] = useState(null); // 'tutor', 'admin', 'coach', or null
    const [chatSessionId, setChatSessionId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    const handleFeatureNavigate = (tab, mode = null, sessionId = null) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setActiveTab(tab);
            setChatMode(mode);
            setChatSessionId(sessionId);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', flexDirection: 'column' }}>
            {/* Mobile Header - Only visible on small screens */}
            <div className="mobile-only" style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e2e8f0', alignItems: 'center', justifyContent: 'space-between', zIndex: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '0px', borderRadius: '8px' }}>
                        <img src="/icon.svg" alt="Logo" style={{ width: '28px', height: '28px' }} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Navigator</span>
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
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    className="main-content"
                >
                    {/* Responsive Padding adjustment usually handled by CSS media queries on .main-content class, or simplistic inline approach here */}
                    <style>{`
                        @media (max-width: 768px) {
                            .main-content { padding: ${activeTab === 'chat' ? 0 : '1.5rem'} !important; }
                        }
                    `}</style>

                    {activeTab === 'dashboard' && <DashboardHome onNavigate={handleFeatureNavigate} userData={userData} onEditStats={() => handleFeatureNavigate('edit-profile')} />}

                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                            <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>
                                {chatMode === 'tutor' ? 'The Tutor' :
                                    chatMode === 'admin' ? 'The Admin' :
                                        chatMode === 'coach' ? 'The Coach' : 'AI Navigator'}
                            </h2>
                            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', minHeight: 0 }}>
                                <ChatInterface mode={chatMode} initialSessionId={chatSessionId} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && <History onSelectSession={(id) => handleFeatureNavigate('chat', null, id)} />}

                    {activeTab === 'schedule' && <BookAdvisor onBack={() => setActiveTab('dashboard')} />}

                    {activeTab === 'courses' && <Courses />}

                    {activeTab === 'tutoring' && <TutoringCenter />}

                    {activeTab === 'wellness' && <WellnessCheck />}

                    {activeTab === 'timer' && <StudyTimer onBack={() => setActiveTab('dashboard')} />}

                    {activeTab === 'smart-study' && <FlashcardGenerator />}

                    {activeTab === 'voice-notes' && <LectureVoiceNotes />}

                    {activeTab === 'syllabus' && <SyllabusScanner />}

                    {activeTab === 'forms' && <DropAddForms onBack={() => setActiveTab('dashboard')} />}

                    {activeTab === 'progress' && <Progress />}

                    {/* Legal Pages */}
                    {activeTab === 'privacy' && <PrivacyPolicy onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'msa' && <MSA onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'sla' && <SLA onBack={() => setActiveTab('dashboard')} />}

                    {/* Social Campus */}
                    {activeTab === 'social' && <SocialCampus />}

                    {/* Admin */}
                    {activeTab === 'adminPanel' && userData?.is_admin && <AdminPanel />}

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
