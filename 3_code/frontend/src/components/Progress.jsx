import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';


const Progress = () => {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, userRes] = await Promise.all([
                    api.get('/api/courses'),
                    api.get('/api/users/me')
                ]);
                setCourses(coursesRes.data);
                setUser(userRes.data);
            } catch (error) {
                console.error("Failed to fetch progress data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Calculations ---
    const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);
    const requiredCredits = 120; // Standard Bachelor's
    const progressPercent = Math.min((totalCredits / requiredCredits) * 100, 100);

    const gradeCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    courses.forEach(c => {
        let base = c.grade.charAt(0);
        if (base === 'N') return; // Skip N/A
        if (gradeCounts[base] !== undefined) gradeCounts[base]++;
    });

    const maxCount = Math.max(...Object.values(gradeCounts), 1); // Avoid div by 0

    const gradePoints = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    // Sort courses by grade value for "Best Performance"
    const sortedCourses = [...courses].sort((a, b) => {
        const valA = gradePoints[a.grade] || -1;
        const valB = gradePoints[b.grade] || -1;
        return valB - valA;
    });

    const bestClass = sortedCourses.length > 0 ? sortedCourses[0] : null;
    const worstClass = sortedCourses.length > 0 ? sortedCourses[sortedCourses.length - 1] : null;


    if (loading) return <div style={{ padding: '2rem' }}>Loading progress...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>Academic Progress</h2>

            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Credits Progress Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card-white"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '8px', borderRadius: '8px' }}>
                                <TrendingUp size={20} />
                            </div>
                            <span style={{ fontWeight: '600', color: '#64748b' }}>Degree Progress</span>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#4f46e5' }}>{Math.round(progressPercent)}%</span>
                    </div>

                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }}
                        />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {totalCredits} / {requiredCredits} Credits Earned
                    </div>
                </motion.div>

                {/* GPA Health Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card-white"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '8px' }}>
                                <Award size={20} />
                            </div>
                            <span style={{ fontWeight: '600', color: '#64748b' }}>GPA Health</span>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1.5rem', color: '#1e293b' }}>{user?.gpa?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'end', height: '40px' }}>
                        {/* Simple decorative bars */}
                        {[40, 60, 55, 70, 65, 80, 75].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: i === 5 ? '#16a34a' : '#e2e8f0', height: `${h}%`, borderRadius: '4px' }}></div>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                        Current Status: <span style={{ color: '#16a34a', fontWeight: '600' }}>Good Standing</span>
                    </div>
                </motion.div>

                {/* On Track Score */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card-white"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#ffedd5', color: '#f97316', padding: '8px', borderRadius: '8px' }}>
                                <CheckCircle size={20} />
                            </div>
                            <span style={{ fontWeight: '600', color: '#64748b' }}>On-Track Score</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f97316' }}>{user?.on_track_score || 0}%</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                        Probability of on-time graduation
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* Grade Distribution Chart */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card-white"
                >
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Grade Distribution</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                        {Object.entries(gradeCounts).map(([grade, count], idx) => {
                            const height = (count / maxCount) * 100;
                            const color = grade === 'A' ? '#4f46e5' : grade === 'B' ? '#6366f1' : grade === 'C' ? '#f59e0b' : '#ef4444';

                            return (
                                <div key={grade} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '40px' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        style={{ width: '100%', background: color, borderRadius: '8px 8px 0 0', position: 'relative' }}
                                    >
                                        {count > 0 && (
                                            <span style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{count}</span>
                                        )}
                                    </motion.div>
                                    <span style={{ marginTop: '12px', fontWeight: '600', color: '#475569' }}>{grade}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Insights / Highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Best Class */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="card-white"
                        style={{ borderLeft: '4px solid #10b981' }}
                    >
                        <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award size={16} /> Strongest Subject
                        </div>
                        {bestClass ? (
                            <>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{bestClass.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Grade: <span style={{ color: '#10b981', fontWeight: '600' }}>{bestClass.grade}</span></div>
                            </>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>No data available</div>
                        )}
                    </motion.div>

                    {/* Needs Attention */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="card-white"
                        style={{ borderLeft: '4px solid #ef4444' }}
                    >
                        <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={16} /> Needs Attention
                        </div>
                        {worstClass && (gradePoints[worstClass.grade] || 0) < 2.0 ? (
                            <>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{worstClass.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Grade: <span style={{ color: '#ef4444', fontWeight: '600' }}>{worstClass.grade}</span></div>
                            </>
                        ) : (
                            <div style={{ color: '#64748b' }}>No critical alerts. Keep it up!</div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
