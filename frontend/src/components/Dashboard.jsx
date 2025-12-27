import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChatInterface from './ChatInterface';
import BookAdvisor from './BookAdvisor';
import TutoringCenter from './TutoringCenter';
import Courses from './Courses';
import WellnessCheck from './WellnessCheck';
import {
    LayoutDashboard, MessageSquare, Calendar, BookOpen,
    TrendingUp, User, Settings, LogOut, Search, Clock,
    Users, FileText, Heart, GraduationCap, ChevronRight, Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, onTabChange, userData }) => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
    const handleLogin = () => { navigate('/login'); };

    const handleProtectedTab = (tab) => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            onTabChange(tab);
        }
    };

    return (
        <div className="sidebar" style={{ width: '280px', flexShrink: 0 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '10px' }}>
                    <GraduationCap color="white" size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Navigator</h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Student Success</span>
                </div>
            </div>

            {/* Nav Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onTabChange('dashboard')}>
                    <LayoutDashboard size={20} /> Dashboard
                </div>
                <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleProtectedTab('chat')}>
                    <MessageSquare size={20} /> AI Navigator
                </div>
                <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => handleProtectedTab('schedule')}>
                    <Calendar size={20} /> Schedule
                </div>
                <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => handleProtectedTab('courses')}>
                    <BookOpen size={20} /> Courses
                </div>
                <div className="nav-item" onClick={() => handleProtectedTab('progress')}><TrendingUp size={20} /> Progress</div>
                <div className={`nav-item ${activeTab === 'tutoring' ? 'active' : ''}`} onClick={() => handleProtectedTab('tutoring')}>
                    <Users size={20} /> Tutoring
                </div>
                <div className={`nav-item ${activeTab === 'wellness' ? 'active' : ''}`} onClick={() => handleProtectedTab('wellness')}>
                    <Heart size={20} /> Wellness
                </div>
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
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {userData?.full_name ? userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userData?.full_name || 'Austin'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Student Navigator</div>
                    </div>
                </div>
            </div>
        </div>
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
                        Good afternoon, {userData?.full_name ? userData.full_name.split(' ')[0] : 'Austin'}!
                    </h1>
                    <p style={{ maxWidth: '500px', fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.6' }}>
                        You have 3 assignments due this week and a chemistry midterm on Tuesday. I'm here to help you stay on track!
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
                    { icon: FileText, color: '#f59e0b', label: 'Drop/Add Forms', sub: 'Deadline: Oct 15' },
                    { icon: Heart, color: '#ec4899', label: 'Wellness Check', sub: 'How are you feeling?', action: 'wellness' },
                    { icon: Clock, color: '#eab308', label: 'Study Timer', sub: 'Stay focused' },
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
                <button onClick={() => onNavigate('chat')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                    Open Chat <ChevronRight size={16} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingBottom: '2rem' }}>
                {[
                    { title: "The Tutor", role: "Course content specialist", color: "#4f46e5", icon: GraduationCap, tags: ["Explain photosynthesis", "Help with calculus", "Review my essay"] },
                    { title: "The Admin", role: "Forms & deadlines expert", color: "#10b981", icon: FileText, tags: ["Drop deadline?", "Add a course", "Transcript request"] },
                    { title: "The Coach", role: "Wellness & support guide", color: "#ec4899", icon: Heart, tags: ["Feeling stressed", "Find a club", "Mental health resouces"] },
                ].map((agent, idx) => (
                    <motion.div key={idx} className="card-white" style={{ cursor: 'pointer' }} onClick={() => onNavigate('chat')}>
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/users/me', {
                full_name: fullName,
                gpa: parseFloat(gpa),
                on_track_score: parseInt(onTrackScore)
            });
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile");
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-white" style={{ width: '400px', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Edit Profile</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Current GPA</label>
                        <input type="number" step="0.1" max="4.0" value={gpa} onChange={(e) => setGpa(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>On-track Score (%)</label>
                        <input type="number" value={onTrackScore} onChange={(e) => setOnTrackScore(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [userData, setUserData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await api.get('/api/users/me');
            setUserData(response.data);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setUserData(null);
            }
        }
    };

    const handleFeatureNavigate = (tab) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setActiveTab(tab);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userData={userData} />

            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                {activeTab === 'dashboard' && <DashboardHome onNavigate={handleFeatureNavigate} userData={userData} onEditStats={() => handleFeatureNavigate('edit-profile')} />}

                {activeTab === 'chat' && (
                    <div style={{ height: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>AI Navigator</h2>
                        <div style={{ height: 'calc(100% - 60px)', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                            <ChatInterface />
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && <BookAdvisor onBack={() => setActiveTab('dashboard')} />}

                {activeTab === 'courses' && <Courses />}

                {activeTab === 'tutoring' && <TutoringCenter />}

                {activeTab === 'wellness' && <WellnessCheck />}
            </main>

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
