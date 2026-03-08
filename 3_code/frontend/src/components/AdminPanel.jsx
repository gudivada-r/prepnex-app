import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Briefcase, Zap, Search, Send, MessageSquare, CheckCircle, Bot, BarChart2, Activity, AlertTriangle } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('campaigns'); // 'campaigns', 'advisors', 'tutors', 'analytics', 'health', 'ednex_health'

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Panel</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', paddingBottom: '4px' }}>
                <button
                    onClick={() => setActiveSection('campaigns')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'campaigns' ? '#4f46e5' : 'white',
                        color: activeSection === 'campaigns' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'campaigns' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Zap size={18} /> Smart Outreach
                </button>
                <button
                    onClick={() => setActiveSection('analytics')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'analytics' ? '#4f46e5' : 'white',
                        color: activeSection === 'analytics' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'analytics' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <BarChart2 size={18} /> Dean's Dashboard
                </button>
                <button
                    onClick={() => setActiveSection('advisors')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'advisors' ? '#4f46e5' : 'white',
                        color: activeSection === 'advisors' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'advisors' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Briefcase size={18} /> Advisors
                </button>
                <button
                    onClick={() => setActiveSection('tutors')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'tutors' ? '#4f46e5' : 'white',
                        color: activeSection === 'tutors' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'tutors' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Users size={18} /> Tutors
                </button>
                <button
                    onClick={() => setActiveSection('health')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'health' ? '#4f46e5' : 'white',
                        color: activeSection === 'health' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'health' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Activity size={18} /> System Health
                </button>
                <button
                    onClick={() => setActiveSection('ednex_health')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'ednex_health' ? '#4f46e5' : 'white',
                        color: activeSection === 'ednex_health' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'ednex_health' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Activity size={18} /> EdNex Module Status
                </button>
            </div>

            <div className="card-white" style={{ minHeight: '400px' }}>
                {activeSection === 'campaigns' ? (
                    <CampaignsManager />
                ) : activeSection === 'analytics' ? (
                    <DeansDashboard />
                ) : activeSection === 'advisors' ? (
                    <AdvisorsManager />
                ) : activeSection === 'health' ? (
                    <SystemHealth />
                ) : activeSection === 'ednex_health' ? (
                    <EdNexHealthDashboard />
                ) : (
                    <TutorsManager />
                )}
            </div>
        </div>
    );
};

const DeansDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/tutoring/analytics/dashboard');
                setMetrics(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Intelligence...</div>;
    if (!metrics) return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load data.</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Tutoring Intelligence</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Real-time demand and content analysis.</p>
                </div>
                <div style={{ background: '#eef2ff', padding: '8px 16px', borderRadius: '20px', color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem' }}>
                    Live Data
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>TOTAL SESSIONS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{metrics.total_sessions}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem' }}>+12% this week</div>
                </div>
                <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>ACTIVE COURSES</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4f46e5' }}>{Object.keys(metrics.demand_by_course).length}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>Across 3 Departments</div>
                </div>
                <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI INSIGHTS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b' }}>{metrics.recent_intelligence.length}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>Generated Briefs</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} /> Concept Heatmap
                    </h3>
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem' }}>
                        {Object.entries(metrics.demand_by_course).length === 0 ? (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No data yet.</div>
                        ) : (
                            Object.entries(metrics.demand_by_course).sort(([, a], [, b]) => b - a).map(([course, count], i) => (
                                <div key={course} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <span>{course}</span>
                                        <span>{count} sessions</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / metrics.total_sessions) * 100}%` }}
                                            style={{ height: '100%', background: i === 0 ? '#ef4444' : '#3b82f6' }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bot size={18} /> Recent Intelligence Briefs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {metrics.recent_intelligence.length === 0 ? (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                                No AI summaries generated yet.
                            </div>
                        ) : (
                            metrics.recent_intelligence.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: '#fefce8', border: '1px solid #fef9c3', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                        {item.course} Needs Analysis
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#713f12', lineHeight: '1.4' }}>
                                        "{item.issue}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CampaignsManager = () => {
    const [step, setStep] = useState(1); // 1: Filter, 2: Composer, 3: Monitor
    const [filters, setFilters] = useState({ gpa: '2.5', risk: 'Any' });
    const [message, setMessage] = useState('');
    const [aiEnabled, setAiEnabled] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        fetchStudents();
        fetchCampaigns();
    }, []);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await api.get('/api/admin/students');
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await api.get('/api/admin/campaigns');
            setCampaigns(res.data);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            const list = students.filter(s => {
                const gpaMatch = s.gpa <= parseFloat(filters.gpa);
                const riskMatch = filters.risk === 'Any' || s.risk === filters.risk;
                return gpaMatch && riskMatch;
            });

            await api.post('/api/admin/campaigns', {
                title: `Outreach ${new Date().toLocaleDateString()}`,
                message: message,
                filters_json: JSON.stringify(filters),
                target_count: list.length,
                status: 'completed'
            });

            fetchCampaigns();
            setStep(3);
        } catch (error) {
            console.error("Failed to launch campaign", error);
            alert("Failed to launch campaign");
        } finally {
            setIsSending(false);
        }
    };

    const filteredStudentsList = students.filter(s => {
        const gpaMatch = s.gpa <= parseFloat(filters.gpa);
        const riskMatch = filters.risk === 'Any' || s.risk === filters.risk;
        return gpaMatch && riskMatch;
    });


    return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Smart Outreach Campaign</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Send bulk nudges and let AI handle the replies.</p>
                </div>
                {step === 3 && (
                    <button onClick={() => setStep(1)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>New Campaign</button>
                )}
            </div>

            {step === 1 && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Step 1: Select Cohort</h3>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>GPA Threshold (Less than)</label>
                            <select
                                value={filters.gpa}
                                onChange={(e) => setFilters({ ...filters, gpa: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '200px' }}
                            >
                                <option value="2.0">2.0</option>
                                <option value="2.5">2.5</option>
                                <option value="3.0">3.0</option>
                                <option value="4.0">4.0</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Risk Level</label>
                            <select
                                value={filters.risk}
                                onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '200px' }}
                            >
                                <option value="Any">Any</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Target Audience ({filteredStudentsList.length} Students)</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Est. Reach: 100%</span>
                        </div>
                        {loadingStudents ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading students...</div>
                        ) : filteredStudentsList.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No students match these filters.</div>
                        ) : (
                            filteredStudentsList.map(s => (
                                <div key={s.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{s.name}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>GPA: {s.gpa} • {s.risk} Risk</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button
                            onClick={() => setStep(2)}
                            style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            Next Step <Zap size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Step 2: Compose Message</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Goal of Nudge</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Registration', 'Tutoring', 'Meeting', 'Financial Aid'].map(tag => (
                                        <button key={tag} onClick={() => setMessage(prev => `Hi {FirstName}, notice you haven't completed ${tag} yet. Need help?`)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>{tag}</button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hi {FirstName}, just checking in..."
                                style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem' }}
                            />

                            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e40af', marginBottom: '0.25rem' }}>
                                            <Bot size={20} /> AI Agent Handling
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a' }}>
                                            If a student replies, the Get Aura will attempt to answer their question immediately (e.g., "Where is the form?") without alerting you unless necessary.
                                        </p>
                                    </div>
                                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                                        <input type="checkbox" checked={aiEnabled} onChange={() => setAiEnabled(!aiEnabled)} style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: aiEnabled ? '#2563eb' : '#ccc', borderRadius: '34px', transition: '.4s' }}></span>
                                        <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: aiEnabled ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', height: 'fit-content' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Preview: Student View</h4>
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>SMS • Now</div>
                                <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                                    {message || "Message preview will appear here..."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Back</button>
                        <button
                            onClick={handleSend}
                            disabled={!message || isSending}
                            style={{ padding: '12px 32px', background: isSending ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: '150px', justifyContent: 'center' }}
                        >
                            {isSending ? 'Sending...' : <><Send size={18} /> Launch Campaign</>}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <CheckCircle size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Campaign Active</h2>
                        <p style={{ color: '#64748b' }}>Your nudge has been sent to 3 students.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>100%</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Delivery Rate</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4f46e5' }}>0%</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Reply Rate (Live)</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>0</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Bot Conversions</div>
                        </div>
                    </div>

                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', color: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={18} /> Campaign History</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
                            {campaigns.slice(0, 5).map(c => (
                                <div key={c.id} style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{c.title}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{c.message.substring(0, 40)}...</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div>{c.target_count} Students</div>
                                        <div style={{ fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdvisorsManager = () => {
    const [advisors, setAdvisors] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdvisor, setNewAdvisor] = useState({ name: '', specialty: 'General', availability: 'Mon-Fri 9-5', email: '' });

    const fetchAdvisors = async () => {
        try {
            const res = await api.get('/api/advisors');
            setAdvisors(res.data);
        } catch (_error) { console.error("Failed to fetch advisors"); }
    };

    useEffect(() => {
        fetchAdvisors();
    }, []);


    const handleDelete = async (id) => {
        if (!window.confirm("Delete this advisor?")) return;
        try {
            await api.delete(`/api/advisors/${id}`);
            setAdvisors(prev => prev.filter(a => a.id !== id));
        } catch (_error) { alert("Failed to delete"); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/advisors', newAdvisor);
            setIsAdding(false);
            setNewAdvisor({ name: '', specialty: 'General', availability: 'Mon-Fri 9-5', email: '' });
            fetchAdvisors();
        } catch (_error) { alert("Failed to add advisor"); }
    };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                <h3 style={{ margin: 0 }}>Advisor Management</h3>
                <button onClick={() => setIsAdding(true)} className="pill-btn" style={{ background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Plus size={16} style={{ verticalAlign: 'middle' }} /> Add Advisor
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input required placeholder="Name" value={newAdvisor.name} onChange={e => setNewAdvisor({ ...newAdvisor, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Specialty" value={newAdvisor.specialty} onChange={e => setNewAdvisor({ ...newAdvisor, specialty: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Availability" value={newAdvisor.availability} onChange={e => setNewAdvisor({ ...newAdvisor, availability: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Email" value={newAdvisor.email} onChange={e => setNewAdvisor({ ...newAdvisor, email: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </form>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Specialty</th>
                        <th style={{ padding: '1rem' }}>Availability</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {advisors.map(adv => (
                        <tr key={adv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{adv.name}</td>
                            <td style={{ padding: '1rem' }}>{adv.specialty}</td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{adv.availability}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button onClick={() => handleDelete(adv.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TutorsManager = () => {
    const [tutors, setTutors] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTutor, setNewTutor] = useState({ name: '', subjects: 'Math', rating: 5.0, reviews: 0, image: '', color: '#4f46e5' });

    const fetchTutors = async () => {
        try {
            const res = await api.get('/api/tutors');
            setTutors(res.data);
        } catch (_error) { console.error("Failed to fetch tutors"); }
    };

    useEffect(() => {
        fetchTutors();
    }, []);


    const handleDelete = async (id) => {
        if (!window.confirm("Delete this tutor?")) return;
        try {
            await api.delete(`/api/tutors/${id}`);
            setTutors(prev => prev.filter(t => t.id !== id));
        } catch (_error) { alert("Failed to delete"); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/tutors', newTutor);
            setIsAdding(false);
            setNewTutor({ name: '', subjects: 'Math', rating: 5.0, reviews: 0, image: '', color: '#4f46e5' });
            fetchTutors();
        } catch (_error) { alert("Failed to add tutor"); }
    };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                <h3 style={{ margin: 0 }}>Tutor Management</h3>
                <button onClick={() => setIsAdding(true)} className="pill-btn" style={{ background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Plus size={16} style={{ verticalAlign: 'middle' }} /> Add Tutor
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input required placeholder="Name" value={newTutor.name} onChange={e => setNewTutor({ ...newTutor, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Subjects (comma sep)" value={newTutor.subjects} onChange={e => setNewTutor({ ...newTutor, subjects: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Color (Hex)" value={newTutor.color} onChange={e => setNewTutor({ ...newTutor, color: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </form>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Subjects</th>
                        <th style={{ padding: '1rem' }}>Color</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tutors.map(tutor => (
                        <tr key={tutor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{tutor.name}</td>
                            <td style={{ padding: '1rem' }}>{tutor.subjects}</td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tutor.color }}></div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button onClick={() => handleDelete(tutor.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SystemHealth = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await api.get('/api/admin/health');
                setHealth(res.data);
            } catch (error) {
                console.error("Failed to fetch system health");
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading System Health...</div>;
    if (!health) return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load health data.</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>System Health overview</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Real-time row counts for all modules.</p>
                </div>
                <div style={{ background: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', color: '#10b981', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> All Systems Operational
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {Object.entries(health).map(([module, count]) => (
                    <div key={module} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{module}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4f46e5' }}>{count}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>Total Rows</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EdNexHealthDashboard = () => {
    const [ednexData, setEdnexData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await api.get('/api/ednex/health');
                setEdnexData(res.data);
            } catch (error) {
                console.error("Failed to fetch EdNex health");
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Establishing connection to Enterprise EdNex Modules...</div>;
    if (!ednexData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to contact EdNex Enterprise.</div>;

    const modules = ednexData.modules || {};
    const errorCount = Object.values(modules).filter(m => m.status.includes('Anomaly') || m.status.includes('Error')).length;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>EdNex Enterprise Diagnostic</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Module-level connectivity validation & integrity checks.</p>
                </div>
                {errorCount === 0 ? (
                    <div style={{ background: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', color: '#10b981', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} /> DataStreams Unified
                    </div>
                ) : (
                    <div style={{ background: '#fef2f2', padding: '8px 16px', borderRadius: '20px', color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={16} /> {errorCount} Module Anomalies Detected
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {Object.entries(modules).map(([moduleName, info]) => {
                    const isError = info.status.includes('Anomaly') || info.status.includes('Error');
                    return (
                        <div key={moduleName} style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: `1px solid ${isError ? '#ef4444' : '#e2e8f0'}`,
                            background: isError ? '#fef2f2' : 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ color: isError ? '#b91c1c' : '#64748b', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                {moduleName}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: isError ? '#ef4444' : '#4f46e5' }}>
                                    {info.count}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Rows</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: isError ? '#b91c1c' : '#10b981' }}>
                                {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                {info.status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPanel;
