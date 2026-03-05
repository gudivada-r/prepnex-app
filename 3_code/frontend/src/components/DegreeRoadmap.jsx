import React, { useState } from 'react';
import { Book, CheckCircle, Circle, AlertCircle, Calendar, ChevronRight, Wand2, Download, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DegreeRoadmap = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [audit, setAudit] = useState([
        { id: 'cs101', code: 'CS 101', name: 'Intro to Programming', credits: 4, type: 'Major', status: 'completed' },
        { id: 'math101', code: 'MATH 101', name: 'Calculus I', credits: 4, type: 'Core', status: 'completed' },
        { id: 'eng101', code: 'ENG 101', name: 'College Writing', credits: 3, type: 'GenEd', status: 'completed' },
        { id: 'cs102', code: 'CS 102', name: 'Data Structures', credits: 4, type: 'Major', status: 'pending' },
        { id: 'math102', code: 'MATH 102', name: 'Calculus II', credits: 4, type: 'Core', status: 'pending' },
        { id: 'phys101', code: 'PHYS 101', name: 'Physics I', credits: 4, type: 'GenEd', status: 'pending' },
        { id: 'cs201', code: 'CS 201', name: 'Algorithms', credits: 3, type: 'Major', status: 'pending', prereq: 'cs102' },
        { id: 'cs202', code: 'CS 202', name: 'Computer Org', credits: 3, type: 'Major', status: 'pending' },
        { id: 'hist101', code: 'HIST 101', name: 'World History', credits: 3, type: 'GenEd', status: 'pending' },
        { id: 'art101', code: 'ART 101', name: 'Art Appreciation', credits: 3, type: 'Elective', status: 'pending' },
    ]);

    const [plan, setPlan] = useState({
        'Fall 2024': ['cs101', 'math101', 'eng101'],
        'Spring 2025': ['cs102', 'math102', 'phys101'],
        'Fall 2025': ['cs201', 'cs202', 'hist101'],
        'Spring 2026': ['art101'],
        'Fall 2026': [],
        'Spring 2027': [],
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Helpers
    const getCourse = (id) => audit.find(c => c.id === id);
    const getSemesterCredits = (sem) => plan[sem].map(id => getCourse(id).credits).reduce((a, b) => a + b, 0);

    const handleAutoPlan = () => {
        setIsGenerating(true);
        // Simulate AI thinking
        setTimeout(() => {
            setPlan({
                'Fall 2024': ['cs101', 'math101', 'eng101'],
                'Spring 2025': ['cs102', 'math102', 'phys101', 'hist101'],
                'Fall 2025': ['cs201', 'cs202', 'art101'],
                'Spring 2026': [],
                'Fall 2026': [],
                'Spring 2027': [],
            });
            setIsGenerating(false);
        }, 1500);
    };

    const moveCourse = (courseId, targetSemester) => {
        // Remove from current pos (if any)
        const newPlan = { ...plan };
        Object.keys(newPlan).forEach(sem => {
            newPlan[sem] = newPlan[sem].filter(id => id !== courseId);
        });

        // Add to new pos
        if (targetSemester) {
            newPlan[targetSemester].push(courseId);
        }
        setPlan(newPlan);
        setSelectedCourse(null);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Degree Roadmap</h1>
                    <p style={{ color: '#64748b' }}>Visualize your path to graduation. Drag and drop courses to plan your semesters.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleAutoPlan}
                        disabled={isGenerating}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isGenerating ? 'AI Generating...' : <><Wand2 size={18} /> AI Auto-Plan</>}
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b' }}
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', height: '100%', minHeight: '600px' }}>
                {/* Sidebar: Degree Requirements */}
                <div style={{ flex: '0 0 300px', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Book size={20} className="text-primary" /> Requirements
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                        {['Core', 'Major', 'GenEd', 'Elective'].map(type => (
                            <div key={type}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{type}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {audit.filter(c => c.type === type).map(course => {
                                        const isPlanned = Object.values(plan).flat().includes(course.id);
                                        return (
                                            <div
                                                key={course.id}
                                                onClick={() => !isPlanned && setSelectedCourse(course)}
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid',
                                                    borderColor: isPlanned ? '#e2e8f0' : (selectedCourse?.id === course.id ? '#6366f1' : '#e2e8f0'),
                                                    background: isPlanned ? '#f8fafc' : 'white',
                                                    opacity: isPlanned ? 0.6 : 1,
                                                    cursor: isPlanned ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{course.code}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{course.name}</div>
                                                </div>
                                                {isPlanned ? <CheckCircle size={16} color="#10b981" /> : <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>{course.credits} Cr</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main: Semester Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignContent: 'start', overflowY: 'auto' }}>
                    {Object.entries(plan).map(([semester, courseIds]) => (
                        <div
                            key={semester}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{semester}</h3>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: getSemesterCredits(semester) > 18 ? '#ef4444' : '#64748b' }}>
                                    {getSemesterCredits(semester)} Credits
                                </span>
                            </div>

                            {/* Course List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '100px' }}>
                                {courseIds.map(id => {
                                    const c = getCourse(id);
                                    return (
                                        <div key={id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{c.code}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.name}</div>
                                            </div>
                                            <button
                                                onClick={() => moveCourse(id, null)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                                            >
                                                <XIcon size={14} />
                                            </button>
                                        </div>
                                    )
                                })}

                                {courseIds.length === 0 && (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                        Empty
                                    </div>
                                )}
                            </div>

                            {/* Drop Zone Action */}
                            {selectedCourse && (
                                <button
                                    onClick={() => moveCourse(selectedCourse.id, semester)}
                                    style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px dashed #6366f1',
                                        background: '#e0e7ff',
                                        color: '#4f46e5',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Plus size={16} /> Add {selectedCourse.code}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const XIcon = ({ size = 24, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default DegreeRoadmap;
