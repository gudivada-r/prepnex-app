import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, FileAudio, FileText, Check, Loader2, Bookmark, BookmarkCheck, Trash2, Clock, Book, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const LectureVoiceNotes = ({ onNavigate }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('defaultLanguage') || 'English');

    // New states for saving and history
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [courseName, setCourseName] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [history, setHistory] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const languages = [
        "English", "Spanish", "Mandarin Chinese", "Hindi", "French",
        "Arabic", "Bengali", "Portuguese", "Russian", "Urdu"
    ];

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/api/lecture-notes/history');
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioBlob(file);
            setRecordingTime(0);
        }
    };

    const [availableMics, setAvailableMics] = useState([]);
    const [selectedMicId, setSelectedMicId] = useState('');

    useEffect(() => {
        getMicrophones();
    }, []);

    const getMicrophones = async () => {
        try {
            // Request permission first to ensure labels are available
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            setAvailableMics(audioInputs);
            if (audioInputs.length > 0) {
                setSelectedMicId(audioInputs[0].deviceId);
            }
        } catch (err) {
            console.error("Error fetching microphones", err);
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            'audio/webm',
            'audio/mp4',
            'audio/ogg',
            'audio/wav',
            'audio/aac'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return ''; // Let browser choose default
    };

    const startRecording = async () => {
        try {
            const constraints = {
                audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Detect supported mime type for iOS compatibility
            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : undefined;

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                // Use the actual mime type of the recorder
                const blobType = mediaRecorderRef.current.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: blobType });
                setAudioBlob(blob);
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setResult(null);

            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert(`Could not access microphone: ${err.message}. Please check iOS Settings > Privacy > Microphone.`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const handleTranscribe = async () => {
        if (!audioBlob) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('language', targetLanguage);

        try {
            const res = await api.post('/api/ai/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setShowSaveDialog(true); // Show save dialog after transcription
        } catch (error) {
            console.error("Transcription failed", error);
            const fallback = {
                transcript: `Demo Transcript (${targetLanguage}): The API call failed, but here is what it would look like.`,
                summary: [`Topic: Demo (${targetLanguage})`, "Key Point: This is a fallback"]
            };
            setResult(fallback);
            setShowSaveDialog(true);
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveNote = async () => {
        if (!result) return;

        try {
            await api.post('/api/lecture-notes/save', {
                course_name: courseName || null,
                professor_name: professorName || null,
                transcript: result.transcript,
                summary: result.summary,
                action_items: result.action_items || [],
                keywords: result.keywords || [],
                follow_up_questions: result.follow_up_questions || [],
                language: targetLanguage,
                duration_seconds: recordingTime
            });

            setShowSaveDialog(false);
            setCourseName('');
            setProfessorName('');
            fetchHistory(); // Refresh history
            alert('Lecture note saved successfully!');
        } catch (error) {
            console.error("Failed to save note", error);
            alert('Failed to save note');
        }
    };

    const toggleBookmark = async (noteId) => {
        try {
            await api.put(`/api/lecture-notes/${noteId}/bookmark`);
            fetchHistory();
        } catch (error) {
            console.error("Failed to toggle bookmark", error);
        }
    };

    const deleteNote = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await api.delete(`/api/lecture-notes/${noteId}`);
            fetchHistory();
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
            }
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '1rem', gap: '1rem' }}>
            {/* History Sidebar */}
            <div style={{ width: showHistory ? '350px' : '0', transition: 'width 0.3s', overflow: 'hidden' }}>
                <div style={{ width: '350px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>Lecture History</h3>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search lectures..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                        />
                        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>No saved lectures yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {history.filter(note =>
                                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (note.course_name && note.course_name.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => setSelectedNote(note)}
                                    style={{
                                        padding: '1rem',
                                        background: selectedNote?.id === note.id ? '#f0f9ff' : '#f8fafc',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: selectedNote?.id === note.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.25rem' }}>{note.title}</div>
                                            {note.course_name && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Book size={12} /> {note.course_name}
                                                </div>
                                            )}
                                            {note.professor_name && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={12} /> {note.professor_name}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button onClick={(e) => { e.stopPropagation(); toggleBookmark(note.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                                {note.is_bookmarked ? <BookmarkCheck size={16} color="#4f46e5" /> : <Bookmark size={16} color="#94a3b8" />}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} /> {formatDate(note.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mic className="text-primary" size={32} color="#4f46e5" />
                            Lecture Voice Notes
                        </h2>
                        <p style={{ color: '#64748b' }}>Record your lectures and let AI transcribe and summarize them for you.</p>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {showHistory ? 'Hide' : 'Show'} History
                    </button>
                </div>

                {/* Show selected note from history */}
                {selectedNote && !result && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{selectedNote.title}</h3>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => onNavigate('smart-study', null, null, { notes: selectedNote.transcript })}
                                    style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                >
                                    Generate Flashcards
                                </button>
                                <button onClick={() => setSelectedNote(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Close
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="card-white" style={{ borderLeft: '4px solid #4f46e5' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Check size={20} color="#4f46e5" /> Key Takeaways
                                    </h4>
                                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {selectedNote.summary.map((point, i) => (
                                            <li key={i} style={{ color: '#334155', lineHeight: '1.5' }}>{point}</li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedNote.action_items?.length > 0 && (
                                    <div className="card-white" style={{ borderLeft: '4px solid #ef4444' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20L12 2z" /></svg>
                                            Action Items
                                        </h4>
                                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {selectedNote.action_items.map((item, i) => (
                                                <li key={i} style={{ color: '#334155' }}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="card-white">
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={20} color="#64748b" /> Full Transcript
                                    </h4>
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', color: '#475569', lineHeight: '1.6', maxHeight: '250px', overflowY: 'auto', fontSize: '0.95rem' }}>
                                        {selectedNote.transcript}
                                    </div>
                                </div>

                                {selectedNote.keywords?.length > 0 && (
                                    <div className="card-white">
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Keywords</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {selectedNote.keywords.map((kw, i) => (
                                                <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.85rem', color: '#475569' }}>{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedNote.follow_up_questions?.length > 0 && (
                                    <div className="card-white" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0369a1' }}>Questions for Professor</h4>
                                        <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {selectedNote.follow_up_questions.map((q, i) => (
                                                <li key={i} style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recorder Interface (rest of the component remains the same) */}
                {!selectedNote && (
                    <>
                        <div className="card-white" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '2rem', fontSize: '3rem', fontFamily: 'monospace', fontWeight: '700', color: isRecording ? '#ef4444' : '#1e293b' }}>
                                {formatTime(recordingTime)}
                            </div>

                            {!isRecording && !audioBlob && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {availableMics.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <select
                                                value={selectedMicId}
                                                onChange={e => setSelectedMicId(e.target.value)}
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', maxWidth: '300px' }}
                                            >
                                                {availableMics.map(mic => (
                                                    <option key={mic.deviceId} value={mic.deviceId}>
                                                        {mic.label || `Microphone ${mic.deviceId.slice(0, 4)}...`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
                                        <button
                                            onClick={startRecording}
                                            style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
                                        >
                                            <Mic size={40} color="white" />
                                        </button>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                style={{ padding: '0.8rem', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <span style={{ fontSize: '24px' }}>📂</span>
                                            </button>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Upload</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isRecording && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#ef4444' }} />
                                    </motion.div>
                                    <button
                                        onClick={stopRecording}
                                        style={{ padding: '0.8rem 2rem', background: '#1e293b', color: 'white', borderRadius: '30px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Stop Recording
                                    </button>
                                </div>
                            )}

                            {!isRecording && audioBlob && !result && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <FileAudio size={24} />
                                        <span>Recording Saved ({formatTime(recordingTime)})</span>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Output Language</label>
                                        <select
                                            value={targetLanguage}
                                            onChange={(e) => setTargetLanguage(e.target.value)}
                                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '200px' }}
                                        >
                                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                                            style={{ padding: '0.8rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={handleTranscribe}
                                            disabled={processing}
                                            style={{ padding: '0.8rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {processing ? <Loader2 className="spin" size={18} /> : <FileText size={18} />}
                                            {processing ? 'Translating...' : 'Transcribe & Summarize'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results */}
                        {result && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                {showSaveDialog && (
                                    <div className="card-white" style={{ marginBottom: '2rem', borderLeft: '4px solid #10b981' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Save Lecture Note</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Course Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={courseName}
                                                    onChange={(e) => setCourseName(e.target.value)}
                                                    placeholder="e.g., Biology 101"
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Professor Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={professorName}
                                                    onChange={(e) => setProfessorName(e.target.value)}
                                                    placeholder="e.g., Dr. Smith"
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => setShowSaveDialog(false)}
                                                style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Skip
                                            </button>
                                            <button
                                                onClick={handleSaveNote}
                                                style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Save Note
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="card-white" style={{ borderLeft: '4px solid #4f46e5' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Check size={20} color="#4f46e5" /> Key Takeaways
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {result.summary.map((point, i) => (
                                                    <li key={i} style={{ color: '#334155', lineHeight: '1.5' }}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {result.action_items?.length > 0 && (
                                            <div className="card-white" style={{ borderLeft: '4px solid #ef4444' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Action Items</h3>
                                                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {result.action_items.map((item, i) => (
                                                        <li key={i} style={{ color: '#334155' }}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="card-white">
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={20} color="#64748b" /> Full Transcript
                                            </h3>
                                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', color: '#475569', lineHeight: '1.6', maxHeight: '300px', overflowY: 'auto' }}>
                                                {result.transcript}
                                            </div>
                                        </div>

                                        {result.keywords?.length > 0 && (
                                            <div className="card-white">
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Keywords</h3>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {result.keywords.map((kw, i) => (
                                                        <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.85rem' }}>{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => onNavigate('smart-study', null, null, { notes: result.transcript })}
                                        style={{ background: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Study with Flashcards
                                    </button>
                                    <button
                                        onClick={() => { setAudioBlob(null); setResult(null); setRecordingTime(0); setShowSaveDialog(false); }}
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        Record New Lecture
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LectureVoiceNotes;
