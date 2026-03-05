import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, FileText, Target, ChevronRight, Award, Upload, Download, Search, CheckCircle, BarChart2 } from 'lucide-react';
import api from '../api';

const CareerPathfinder = () => {
    const [activeTab, setActiveTab] = useState('jobs'); // 'resume', 'jobs', 'skills'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Resume State
    const [resumeContent, setResumeContent] = useState('');
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);

    // Jobs State
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Skills State
    const [targetRole, setTargetRole] = useState('');
    const [skillAnalysis, setSkillAnalysis] = useState(null);

    useEffect(() => {
        if (activeTab === 'jobs' && jobs.length === 0) {
            fetchJobs();
        }
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/career/jobs');
            setJobs(res.data.jobs);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateResume = async () => {
        setIsGeneratingResume(true);
        try {
            const res = await api.post('/api/career/generate-resume');
            setResumeContent(res.data.resume);
        } catch (err) {
            console.error("Resume Gen Failed", err);
            setError("Failed to generate resume.");
        } finally {
            setIsGeneratingResume(false);
        }
    };

    const handleAnalyzeSkills = async () => {
        if (!targetRole) return;
        setLoading(true);
        try {
            const res = await api.post('/api/career/skill-gap', { target_role: targetRole });
            setSkillAnalysis(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div style={{ padding: '0 1rem 2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Career Pathfinder
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                    Bridge the gap between your degree and your dream career.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'jobs', label: 'Internship Matcher', icon: Search },
                    { id: 'resume', label: 'AI Resume Builder', icon: FileText },
                    { id: 'skills', label: 'Skill Gap Analysis', icon: Target },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.id ? '#fff' : '#94a3b8',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'jobs' && (
                    <motion.div key="jobs" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {jobs.slice((currentPage - 1) * 10, currentPage * 10).map((job) => (
                                <div key={job.id} className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{job.title}</h3>
                                            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>{job.company} • {job.location}</p>
                                        </div>
                                        <div style={{
                                            background: job.match_score > 90 ? '#ecfdf5' : '#fffbeb',
                                            color: job.match_score > 90 ? '#059669' : '#d97706',
                                            border: `1px solid ${job.match_score > 90 ? '#a7f3d0' : '#fde68a'}`,
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700'
                                        }}>
                                            {job.match_score}% Match
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#475569' }}>
                                        This role aligns perfectly with your major and recent coursework in related subjects.
                                    </p>
                                    <button style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        color: '#4f46e5',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        Apply Now <ChevronRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {jobs.length > 10 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', paddingBottom: '2rem' }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: currentPage === 1 ? '#f1f5f9' : 'white',
                                        color: currentPage === 1 ? '#94a3b8' : '#475569',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ color: '#475569', fontWeight: '600' }}>
                                    Page {currentPage} of {Math.ceil(jobs.length / 10)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(jobs.length / 10)))}
                                    disabled={currentPage === Math.ceil(jobs.length / 10)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: currentPage === Math.ceil(jobs.length / 10) ? '#f1f5f9' : 'white',
                                        color: currentPage === Math.ceil(jobs.length / 10) ? '#94a3b8' : '#475569',
                                        cursor: currentPage === Math.ceil(jobs.length / 10) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'resume' && (
                    <motion.div key="resume" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card-white" style={{ padding: '3rem', maxWidth: '850px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        {!resumeContent ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                    <FileText size={40} style={{ color: '#4f46e5' }} />
                                </div>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b', fontWeight: '800' }}>Build Your Professional Resume</h3>
                                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                    Our AI analyzes your transcript, major, and background to create a tailored, ATS-friendly resume highlighting your academic achievements.
                                </p>
                                <button
                                    onClick={handleGenerateResume}
                                    disabled={isGeneratingResume}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                                        borderRadius: '50px',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        cursor: isGeneratingResume ? 'wait' : 'pointer',
                                        opacity: isGeneratingResume ? 0.9 : 1,
                                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                    }}
                                >
                                    {isGeneratingResume ? 'Analyzing Coursework...' : 'Generate Resume Now'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Generated Preview</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Editable Markdown Format</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setResumeContent('')} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Reset</button>
                                        <button style={{
                                            padding: '0.5rem 1.25rem',
                                            background: '#4f46e5',
                                            borderRadius: '8px',
                                            border: 'none',
                                            color: '#fff',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer'
                                        }}>
                                            <Download size={18} /> Download
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={resumeContent}
                                    onChange={(e) => setResumeContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '600px',
                                        background: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        padding: '2rem',
                                        color: '#334155',
                                        fontFamily: "'Courier New', Courier, monospace",
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        resize: 'vertical',
                                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'skills' && (
                    <motion.div key="skills" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card-white" style={{ padding: '3rem', maxWidth: '850px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <Target size={32} style={{ color: '#4f46e5' }} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b', fontWeight: '800' }}>Skill Gap Analysis</h3>
                            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
                                Discover what skills you're missing for your dream job and get personalized course recommendations.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                            <input
                                type="text"
                                placeholder="Enter your dream job title (e.g. Data Scientist, UX Designer)"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid #cbd5e1',
                                    background: '#fff',
                                    color: '#1e293b',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            />
                            <button
                                onClick={handleAnalyzeSkills}
                                disabled={loading || !targetRole}
                                style={{
                                    padding: '0 2.5rem',
                                    background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: (loading || !targetRole) ? 'default' : 'pointer',
                                    opacity: (loading || !targetRole) ? 0.7 : 1,
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                }}
                            >
                                {loading ? 'Analyzing...' : 'Analyze Gap'}
                            </button>
                        </div>

                        {skillAnalysis && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                        <CheckCircle size={20} /> Skills You Have
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {skillAnalysis.acquired_skills?.map((skill, i) => (
                                            <span key={i} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                                                {skill}
                                            </span>
                                        ))}
                                        {(!skillAnalysis.acquired_skills || skillAnalysis.acquired_skills.length === 0) && (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No matching skills found yet.</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                        <Target size={20} /> Skills You Need
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {skillAnalysis.missing_skills?.map((skill, i) => (
                                            <span key={i} style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                        <Award size={20} color="#4f46e5" /> Recommended Actions
                                    </h4>
                                    <ul style={{ paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8', margin: 0 }}>
                                        {skillAnalysis.recommended_actions?.map((action, i) => (
                                            <li key={i} style={{ marginBottom: '0.5rem' }}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CareerPathfinder;
