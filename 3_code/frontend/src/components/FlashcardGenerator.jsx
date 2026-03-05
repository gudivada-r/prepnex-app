import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Brain, Sparkles, ChevronLeft, ChevronRight, FileText, BookOpen } from 'lucide-react';
import api from '../api';
import './FlashcardGenerator.css';

const FlashcardGenerator = ({ prefilledData }) => {
    const [mode, setMode] = useState('notes'); // 'notes' or 'canvas'
    const [notes, setNotes] = useState(prefilledData?.notes || '');

    // Canvas Mode Inputs
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [chapter, setChapter] = useState('');

    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (prefilledData?.notes) {
            setNotes(prefilledData.notes);
            setMode('notes');
        }
    }, [prefilledData]);

    useEffect(() => {
        // Fetch courses for dropdown
        const fetchCourses = async () => {
            try {
                const res = await api.get('/api/courses');
                setCourses(res.data);
            } catch (_err) {
                console.error("Failed to load courses");

                // Mock for demo if offline
                setCourses([
                    { id: 1, name: "Biology 101" },
                    { id: 2, name: "Calculus I" },
                    { id: 3, name: "Art History" }
                ]);
            }
        };
        fetchCourses();
    }, []);

    const handleGenerate = async () => {
        if (mode === 'notes' && !notes.trim()) return;
        if (mode === 'canvas' && (!selectedCourse || !chapter.trim())) return;

        setLoading(true);
        try {
            const payload = mode === 'notes'
                ? { note_content: notes }
                : { course_name: selectedCourse, topic: chapter };

            const res = await api.post('/api/ai/flashcards', payload);
            setFlashcards(res.data.flashcards);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (error) {
            console.error("Flashcard Generation Error:", error.response?.data || error.message);
            const topic = mode === 'notes' ? (notes.length < 50 ? notes : "Review Notes") : (chapter || "Course Material");
            const fallbackCards = Array.from({ length: 8 }, (_, i) => ({
                id: i + 1,
                front: `Key Concept ${i + 1} (${topic})`,
                back: `This is a fallback card. The AI service may be experiencing a timeout (Vercel hobby limit is 10s) or the API Key is missing. Try shorter notes or wait a moment.`
            }));

            setFlashcards(fallbackCards);
            setCurrentIndex(0);
            setIsFlipped(false);
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    return (
        <div className="flashcard-container">
            {/* Header */}
            <div className="flashcard-header">
                <h2 className="flashcard-title">
                    <Brain className="text-primary" size={32} color="#4f46e5" />
                    Smart Study: AI Flashcards
                </h2>
                <p className="flashcard-subtitle">Generate active recall cards from your own notes or directly from your LMS course materials.</p>
            </div>

            {flashcards.length === 0 ? (
                // Input Mode
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-white input-card">

                    {/* Mode Toggle Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setMode('notes')}
                            style={{
                                flex: 1, padding: '1rem',
                                background: mode === 'notes' ? '#f8fafc' : 'white',
                                borderBottom: mode === 'notes' ? '2px solid #4f46e5' : 'none',
                                fontWeight: mode === 'notes' ? '700' : '500',
                                color: mode === 'notes' ? '#4f46e5' : '#64748b',
                                borderTopLeftRadius: '12px',
                                cursor: 'pointer', border: 'none'
                            }}
                        >
                            <FileText size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                            Paste Notes
                        </button>
                        <button
                            onClick={() => setMode('canvas')}
                            style={{
                                flex: 1, padding: '1rem',
                                background: mode === 'canvas' ? '#f8fafc' : 'white',
                                borderBottom: mode === 'canvas' ? '2px solid #4f46e5' : 'none',
                                fontWeight: mode === 'canvas' ? '700' : '500',
                                color: mode === 'canvas' ? '#4f46e5' : '#64748b',
                                borderTopRightRadius: '12px',
                                cursor: 'pointer', border: 'none'
                            }}
                        >
                            <BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                            Import from Course
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {mode === 'notes' ? (
                            <textarea
                                className="flashcard-textarea"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Paste your notes here... (e.g. 'Photosynthesis is the process by which plants use sunlight...')"
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Select Course</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="">-- Choose a course --</option>
                                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Chapter or Topic</label>
                                    <input
                                        type="text"
                                        value={chapter}
                                        onChange={(e) => setChapter(e.target.value)}
                                        placeholder="e.g. Chapter 4: Thermodynamics"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="generate-btn"
                                onClick={handleGenerate}
                                disabled={loading || (mode === 'notes' ? !notes.trim() : (!selectedCourse || !chapter.trim()))}
                            >
                                {loading ? <RotateCcw className="spin" size={20} /> : <Sparkles size={20} />}
                                {loading ? 'Analyzing Content...' : 'Generate Flashcards'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                // Flashcard Interactive Mode (Reused)
                <div className="card-mode-container">
                    <div className="scene">
                        <motion.div
                            style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: 'spring' }}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="card-face card-front">
                                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '1rem' }}>Concept</span>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{flashcards[currentIndex].front}</h3>
                                <div style={{ position: 'absolute', bottom: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>Tap to flip</div>
                            </div>
                            <div className="card-face card-back">
                                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.8, marginBottom: '1rem' }}>Definition</span>
                                <p style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>{flashcards[currentIndex].back}</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="controls">
                        <button onClick={prevCard} className="circle-btn"><ChevronLeft size={24} /></button>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>{currentIndex + 1} / {flashcards.length}</span>
                        <button onClick={nextCard} className="circle-btn"><ChevronRight size={24} /></button>
                    </div>

                    <button
                        onClick={() => { setFlashcards([]); setNotes(''); }}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Create New Set
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlashcardGenerator;
