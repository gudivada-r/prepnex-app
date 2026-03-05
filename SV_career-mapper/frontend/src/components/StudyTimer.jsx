import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Play, Pause, RotateCcw, Coffee, BookOpen,
    Settings, Volume2, VolumeX, CheckCircle,
    ChevronRight, Timer, Brain, Zap, ChevronLeft
} from 'lucide-react';

const StudyTimer = ({ onBack }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [mute, setMute] = useState(false);

    const [settings, setSettings] = useState({
        work: 25,
        shortBreak: 5,
        longBreak: 15
    });

    const timerRef = useRef(null);
    const audioRef = useRef(null);

    // Audio setup (using a public sound or keeping it silent for now)
    // For now, let's focus on the visual and logic.

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);

        // Play sound if not muted
        if (!mute) {
            // Placeholder for sound
            console.log("Timer Complete!");
        }

        if (mode === 'work') {
            const nextSessionCount = sessionsCompleted + 1;
            setSessionsCompleted(nextSessionCount);
            if (nextSessionCount % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('work');
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(settings[mode] * 60);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(settings[newMode] * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const total = settings[mode] * 60;
        return ((total - timeLeft) / total) * 100;
    };

    const modeColors = {
        work: {
            primary: '#4f46e5',
            bg: '#eef2ff',
            text: '#1e1b4b'
        },
        shortBreak: {
            primary: '#10b981',
            bg: '#ecfdf5',
            text: '#064e3b'
        },
        longBreak: {
            primary: '#3b82f6',
            bg: '#eff6ff',
            text: '#172554'
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>
                        <ChevronLeft size={18} /> Back to Dashboard
                    </button>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Focused Study</h2>
                    <p style={{ color: '#64748b' }}>Master your time with the Pomodoro technique.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setMute(!mute)}
                        style={{ border: 'none', background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    >
                        {mute ? <VolumeX size={20} color="#64748b" /> : <Volume2 size={20} color="#64748b" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ border: 'none', background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    >
                        <Settings size={20} color="#64748b" />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Main Timer Card */}
                <motion.div
                    layout
                    style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '3rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Progress Indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '4px',
                        width: `${getProgress()}%`,
                        background: modeColors[mode].primary,
                        transition: 'width 1s linear'
                    }} />

                    {/* Mode Tabs */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '3rem' }}>
                        {['work', 'shortBreak', 'longBreak'].map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                style={{
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: mode === m ? 'white' : 'transparent',
                                    color: mode === m ? modeColors[m].primary : '#64748b',
                                    fontWeight: '600',
                                    boxShadow: mode === m ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <motion.div
                        key={timeLeft}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            fontSize: '8rem',
                            fontWeight: '800',
                            fontVariantNumeric: 'tabular-nums',
                            color: modeColors[mode].text,
                            lineHeight: 1,
                            marginBottom: '1rem'
                        }}
                    >
                        {formatTime(timeLeft)}
                    </motion.div>

                    <div style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem', fontWeight: '500' }}>
                        {mode === 'work' ? 'Stay focused, you can do this!' : 'Take a deep breath and relax.'}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button
                            onClick={resetTimer}
                            style={{
                                background: '#f1f5f9',
                                border: 'none',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            <RotateCcw size={24} />
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTimer}
                            style={{
                                background: modeColors[mode].primary,
                                border: 'none',
                                padding: '16px 48px',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                color: 'white',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                boxShadow: `0 10px 20px ${modeColors[mode].primary}33`
                            }}
                        >
                            {isRunning ? <><Pause size={24} fill="white" /> Pause</> : <><Play size={24} fill="white" /> Start</>}
                        </motion.button>

                        <button
                            onClick={handleTimerComplete}
                            style={{
                                background: '#f1f5f9',
                                border: 'none',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </motion.div>

                {/* Sidebar Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Stats Card */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px' }}>
                                <Zap size={20} color="#d97706" />
                            </div>
                            <h4 style={{ margin: 0, fontWeight: '700' }}>Daily Focus</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{sessionsCompleted}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{Math.floor((sessionsCompleted * settings.work) / 60)}h {(sessionsCompleted * settings.work) % 60}m</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Focus</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1 }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontWeight: '700' }}>Focus Tips</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { icon: Brain, text: "Break your tasks into small, manageable chunks.", color: "#4f46e5" },
                                { icon: Coffee, text: "Actually take your breaks. Walk away from your screen.", color: "#10b981" },
                                { icon: Timer, text: "Consistency is key. Try to do 4 sessions a day.", color: "#3b82f6" }
                            ].map((tip, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ color: tip.color, marginTop: '2px' }}><tip.icon size={18} /></div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{tip.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal (Simplified as an overlay) */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card-white"
                            style={{ width: '350px', padding: '2rem' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Timer Settings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { label: 'Focus (min)', key: 'work' },
                                    { label: 'Short Break (min)', key: 'shortBreak' },
                                    { label: 'Long Break (min)', key: 'longBreak' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#64748b' }}>{field.label}</label>
                                        <input
                                            type="number"
                                            value={settings[field.key]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setSettings(prev => ({ ...prev, [field.key]: val }));
                                                if (mode === field.key) setTimeLeft(val * 60);
                                            }}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    marginTop: '2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Settings
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudyTimer;
