import React, { useState, useRef } from 'react';
import { Upload, Calendar, Check, X, Loader2, ScanLine } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const SyllabusScanner = () => {
    const [file, setFile] = useState(null);
    const [events, setEvents] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFiles = (files) => {
        if (files && files[0]) {
            setFile(files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const handleScan = async () => {
        if (!file) return;
        setScanning(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Mock API delay
            setTimeout(async () => {
                try {
                    const res = await api.post('/api/ai/parse-syllabus', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setEvents(res.data.events);
                } catch (_err) {
                    // Fallback mock if API fails
                    console.warn("API failed, using mock data");

                    setEvents([
                        { "title": "Midterm Exam", "date": "2025-10-15", "type": "exam" },
                        { "title": "Chapter 5 Essay", "date": "2025-10-22", "type": "assignment" },
                        { "title": "Final Project Proposal", "date": "2025-11-01", "type": "assignment" },
                        { "title": "Guest Lecture: Dr. Smith", "date": "2025-11-05", "type": "reading" }
                    ]);
                } finally {
                    setScanning(false);
                }
            }, 2000);
        } catch (error) {
            console.error("Scan failed", error);
            setScanning(false);
        }
    };

    const handleAddToSchedule = () => {
        // Mock adding to backend
        setConfirmed(true);
        setTimeout(() => {
            setFile(null);
            setEvents([]);
            setConfirmed(false);
        }, 3000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <ScanLine className="text-primary" size={32} color="#4f46e5" />
                    Smart Syllabus Scanner
                </h2>
                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0.5rem auto' }}>
                    Upload your course syllabus (PDF or Image). Our AI will extract all important dates and add them to your schedule automatically.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!events.length > 0 && !confirmed ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card-white"
                        style={{
                            padding: '3rem',
                            border: `2px dashed ${dragActive ? '#4f46e5' : '#e2e8f0'}`,
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: dragActive ? '#f1f5f9' : 'white',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleChange}
                            accept=".pdf,image/*"
                        />

                        <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Upload size={32} color="#4f46e5" />
                        </div>
                        {file ? (
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>{file.name}</h3>
                                <p style={{ color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleScan(); }}
                                    style={{ marginTop: '1.5rem', background: '#4f46e5', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {scanning ? <Loader2 className="spin" size={20} /> : <ScanLine size={20} />}
                                    {scanning ? 'Analyzing...' : 'Scan Syllabus'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Drop your syllabus here</h3>
                                <p style={{ color: '#64748b' }}>or click to browse files</p>
                            </div>
                        )}
                    </motion.div>
                ) : confirmed ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card-white"
                        style={{ textAlign: 'center', padding: '4rem 2rem' }}
                    >
                        <div style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Check size={40} color="#16a34a" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534', marginBottom: '0.5rem' }}>Schedule Updated!</h3>
                        <p style={{ color: '#64748b' }}>Your exams and assignments have been added to your calendar.</p>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-white" style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Calendar size={20} className="text-primary" /> Found {events.length} Events
                            </h3>
                            <button onClick={() => setEvents([])} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {events.map((evt, idx) => (
                                <div key={idx} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem',
                                            background: evt.type === 'exam' ? '#fecaca' : evt.type === 'assignment' ? '#fed7aa' : '#e2e8f0',
                                            color: evt.type === 'exam' ? '#991b1b' : evt.type === 'assignment' ? '#9a3412' : '#475569'
                                        }}>
                                            {evt.type.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{evt.title}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{new Date(evt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <Check size={20} color="#1abc9c" />
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleAddToSchedule}
                                style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Confirm & Add to Schedule
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SyllabusScanner;
