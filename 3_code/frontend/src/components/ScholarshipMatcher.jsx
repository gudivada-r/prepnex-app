import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Sparkles,
    FileText,
    ChevronRight,
    Search,
    BrainCircuit,
    Award,
    Clock,
    UserCircle,
    Copy,
    Check

} from 'lucide-react';
import api from '../api';
import './ScholarshipMatcher.css';

const ScholarshipMatcher = () => {
    const [user, setUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [draftingId, setDraftingId] = useState(null);
    const [currentDraft, setCurrentDraft] = useState('');
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        major: '',
        background: '',
        interests: '',
        gpa: 0
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/api/users/me');
            setUser(res.data);
            setProfileData({
                major: res.data.major || '',
                background: res.data.background || '',
                interests: res.data.interests || '',
                gpa: res.data.gpa || 0
            });

            // If profile is complete, auto-match
            if (res.data.major) {
                handleMatch();
            }
        } catch (err) {
            console.error("User fetch failed:", err.response?.data || err.message);
        }

    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/api/users/me', profileData);
            setUser({ ...user, ...profileData });
            setIsEditingProfile(false);
            handleMatch();
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMatch = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/ai/scholarships/match');
            setMatches(res.data);
        } catch (err) {
            console.error("Matching failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDraft = async (scholarshipId) => {
        setDraftingId(scholarshipId);
        try {
            const res = await api.post('/api/ai/scholarships/draft', { scholarship_id: scholarshipId });
            setCurrentDraft(res.data.draft);
            setShowDraftModal(true);
        } catch (err) {
            console.error("Drafting failed", err);
        } finally {
            setDraftingId(null);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentDraft);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="scholarship-container">
            {/* Header Area */}
            <div className="scholarship-header">
                <div>
                    <h1 className="title-gradient">AI Scholarship Matcher</h1>
                    <p className="subtitle">Precision matching and personalized statement drafting powered by Student Success AI.</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <Award color="#4f46e5" />
                        <span>{matches.length} Matches Found</span>
                    </div>
                </div>
            </div>

            <div className="scholarship-grid">
                {/* Profile Section */}
                <div className="profile-section">
                    <div className="glass-card profile-card">
                        <div className="card-header">
                            <UserCircle size={20} />
                            <h3>Your Match Profile</h3>
                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="edit-btn">
                                {isEditingProfile ? 'Cancel' : 'Update Profile'}
                            </button>
                        </div>

                        {isEditingProfile ? (
                            <form onSubmit={handleUpdateProfile} className="profile-form">
                                <div className="form-group">
                                    <label>Major / Field of Study</label>
                                    <input
                                        type="text"
                                        value={profileData.major}
                                        onChange={e => setProfileData({ ...profileData, major: e.target.value })}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Background (Identity, Heritage, Region)</label>
                                    <textarea
                                        value={profileData.background}
                                        onChange={e => setProfileData({ ...profileData, background: e.target.value })}
                                        placeholder="Briefly describe your background for diversity-based matches..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Interests & Goals</label>
                                    <textarea
                                        value={profileData.interests}
                                        onChange={e => setProfileData({ ...profileData, interests: e.target.value })}
                                        placeholder="What are your career goals or research interests?"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="save-btn">
                                    {loading ? 'Saving...' : 'Search for Matches'}
                                </button>
                            </form>
                        ) : (
                            <div className="profile-display">
                                <div className="profile-item">
                                    <span className="label">Major:</span>
                                    <span className="value">{user?.major || 'Not set'}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="label">GPA:</span>
                                    <span className="value">{user?.gpa || '0.00'}</span>
                                </div>
                                <p className="profile-info">The AI uses your background and interests to find the highest-probability matches.</p>
                                <button onClick={handleMatch} className="refresh-btn">
                                    <BrainCircuit size={16} />
                                    Force AI Re-scan
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Results */}
                <div className="matches-section">
                    {loading && matches.length === 0 ? (
                        <div className="loading-state">
                            <Sparkles className="spin-slow" size={48} color="#4f46e5" />
                            <p>Scanning global scholarship databases...</p>
                        </div>
                    ) : (
                        <div className="matches-list">
                            <AnimatePresence>
                                {matches.map((match, idx) => (
                                    <motion.div
                                        key={match.scholarship.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="match-card glass-card"
                                    >
                                        <div className="match-score">
                                            <div className="circular-score" style={{ '--score': `${match.score}%` }}>
                                                <span>{match.score}%</span>
                                            </div>
                                            <span className="match-tag">AI Match</span>
                                        </div>

                                        <div className="match-content">
                                            <div className="match-main">
                                                <h4>{match.scholarship.title}</h4>
                                                <p className="provider">{match.scholarship.provider}</p>
                                                <div className="details-row">
                                                    <span className="amount">${match.scholarship.amount.toLocaleString()}</span>
                                                    <span className="category-tag">{match.scholarship.category}</span>
                                                    <span className="deadline">
                                                        <Clock size={14} />
                                                        {new Date(match.scholarship.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="reasoning">
                                                    <strong>AI Insight:</strong> {match.reasoning}
                                                </div>
                                            </div>

                                            <div className="match-actions">
                                                <button
                                                    className="draft-btn"
                                                    onClick={() => handleDraft(match.scholarship.id)}
                                                    disabled={draftingId === match.scholarship.id}
                                                >
                                                    {draftingId === match.scholarship.id ? (
                                                        <Sparkles className="spin" size={16} />
                                                    ) : (
                                                        <FileText size={16} />
                                                    )}
                                                    {draftingId === match.scholarship.id ? 'Drafting...' : 'Draft Statement'}
                                                </button>
                                                <button className="view-btn">
                                                    Apply Now <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {matches.length === 0 && !loading && (
                                <div className="empty-state">
                                    <Search size={48} color="#94a3b8" />
                                    <h3>No matches yet</h3>
                                    <p>Update your profile with your major and interests to find relevant scholarships.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Draft Modal */}
            <AnimatePresence>
                {showDraftModal && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="draft-modal glass-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="modal-header">
                                <h3>AI-Generated Personal Statement</h3>
                                <button onClick={() => setShowDraftModal(false)} className="close-btn">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="draft-content">
                                    {currentDraft}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <p className="disclaimer">Note: This is an AI-generated draft. Please review and personalize it before submitting.</p>
                                <button onClick={copyToClipboard} className="copy-btn">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScholarshipMatcher;
