import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Using local API URL or relative path
const API_BASE = "/api";

const TexasAnalytics = () => {
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [view, setView] = useState('overview'); // overview, college_detail

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const res = await fetch(`${API_BASE}/texas/colleges`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setColleges(data);
            }
        } catch (e) {
            console.error("Failed to fetch colleges", e);
        }
    };

    const handleAnalyze = async (college) => {
        setSelectedCollege(college);
        setLoading(true);
        setView('college_detail');
        setAnalysisData(null);

        try {
            const res = await fetch(`${API_BASE}/texas/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instId: college.id,
                    sector: college.sector,
                    typeId: college.type_id,
                    name: college.name
                })
            });
            const data = await res.json();
            setAnalysisData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Institutional Research
                    </h1>
                    <p style={{ color: '#64748b' }}>Texas Higher Education Accountability Intelligence</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.875rem' }}>
                    State Data Source
                </div>
            </div>

            {/* Content Switcher */}
            {view === 'overview' ? (
                <div className="card-white" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Search className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Texas Colleges..."
                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1.1rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                        {colleges.map(college => (
                            <div
                                key={college.id}
                                onClick={() => handleAnalyze(college)}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: 'white'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{college.name}</h3>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                    {college.sector}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <button onClick={() => setView('overview')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}>
                        ← Back to Search
                    </button>

                    {/* AI Insight Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-card"
                        style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                    <TrendingUp size={24} color="#38bdf8" />
                                </div>
                                <h2 style={{ margin: 0, color: 'white' }}>Gemini Analysis</h2>
                            </div>
                            {loading && <RefreshCw className="animate-spin" />}
                        </div>

                        {loading ? (
                            <p style={{ color: '#94a3b8' }}>Analyzing institutional metrics with Gemini AI...</p>
                        ) : (
                            <div style={{ color: '#e2e8f0', lineHeight: '1.6', width: '100%' }}>
                                <ReactMarkdown>
                                    {analysisData?.ai_insight || "No analysis generated."}
                                </ReactMarkdown>
                            </div>
                        )}
                    </motion.div>

                    {/* Report Data Grid */}
                    {!loading && analysisData?.data_summary.reports && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {analysisData.data_summary.reports.map((report, idx) => (
                                <div key={idx} className="card-white" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>{report.title}</h3>
                                    {/* Simple visualization of first few data points */}
                                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                                        {Array.isArray(report.data) && report.data.slice(0, 5).map((row, rIdx) => (
                                            <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <span>{row.Label || row.Category || 'Metric'}</span>
                                                <span style={{ fontWeight: 600 }}>{row.Value || row.Count || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TexasAnalytics;
