import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Smile, Frown, Meh, Sun, Moon,
    Coffee, Users, Brain, Info,
    ChevronRight, CheckCircle, Wind,
    ShieldAlert, Sparkles
} from 'lucide-react';

const WellnessCheck = () => {
    const [step, setStep] = useState('mood'); // 'mood', 'survey', 'result'
    const [mood, setMood] = useState(null);
    const [surveyData, setSurveyData] = useState({
        sleep: 3, // 1-5
        stress: 3,
        social: 3,
        energy: 3
    });

    const moods = [
        { icon: Frown, label: 'Not Great', color: '#f87171', value: 1 },
        { icon: Meh, label: 'Okay', color: '#fbbf24', value: 2 },
        { icon: Smile, label: 'Good', color: '#34d399', value: 3 },
        { icon: Sun, label: 'Awesome', color: '#60a5fa', value: 4 },
    ];

    const resources = [
        { title: "Student Counseling Services", description: "Free professional counseling for all students.", contact: "555-0123", icon: Users, color: "#4f46e5" },
        { title: "Meditation Hub", description: "Daily guided sessions to help reduce academic stress.", contact: "Room 402", icon: Wind, color: "#10b981" },
        { title: "Crisis Hotline", description: "24/7 immediate support for mental health emergencies.", contact: "988", icon: ShieldAlert, color: "#ef4444" },
    ];

    const handleMoodSelect = (m) => {
        setMood(m);
        setStep('survey');
    };

    const handleSurveySubmit = () => {
        setStep('result');
    };

    const getAdvice = () => {
        if (mood?.value <= 2 || surveyData.stress >= 4) {
            return {
                title: "Take a Breather",
                text: "It sounds like you're carrying a lot right now. Remember that it's okay to step back and recharge. Consider reaching out to a friend or the counseling center.",
                action: "Schedule a break"
            };
        }
        return {
            title: "Keep the Momentum",
            text: "You're doing great! To maintain this balance, try to stick to your sleep routine and stay connected with your study group.",
            action: "Add a habit"
        };
    };

    const advice = getAdvice();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Wellness Check</h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Your well-being is the foundation of your success.</p>
            </div>

            <AnimatePresence mode="wait">
                {step === 'mood' && (
                    <motion.div
                        key="mood"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card-white"
                        style={{ textAlign: 'center', padding: '3rem 2rem' }}
                    >
                        <Heart size={48} color="#ec4899" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>How are you feeling today?</h3>
                        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Check in with yourself before you dive into your studies.</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {moods.map((m, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMoodSelect(m)}
                                    style={{
                                        width: '100px',
                                        padding: '1.5rem 1rem',
                                        borderRadius: '20px',
                                        background: '#f8fafc',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <m.icon size={32} color={m.color} />
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>{m.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'survey' && (
                    <motion.div
                        key="survey"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card-white"
                        style={{ padding: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#ec489920', padding: '10px', borderRadius: '12px' }}>
                                <Brain size={24} color="#ec4899" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Quick Check-in</h3>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>A few more details help us provide better support.</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem', marginBottom: '2.5rem' }}>
                            {[
                                { key: 'sleep', label: 'Sleep Quality', icon: Moon, color: '#4f46e5' },
                                { key: 'stress', label: 'Stress Levels', icon: Coffee, color: '#f59e0b' },
                                { key: 'social', label: 'Social Connection', icon: Users, color: '#10b981' },
                                { key: 'energy', label: 'Energy Levels', icon: Sparkles, color: '#ec4899' },
                            ].map((item) => (
                                <div key={item.key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <item.icon size={18} color={item.color} /> {item.label}
                                        </label>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {surveyData[item.key] <= 2 ? 'Low' : surveyData[item.key] >= 4 ? 'High' : 'Moderate'}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={surveyData[item.key]}
                                        onChange={(e) => setSurveyData({ ...surveyData, [item.key]: parseInt(e.target.value) })}
                                        style={{ width: '100%', accentColor: item.color }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSurveySubmit}
                            style={{ width: '100%', padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                            Complete Check-in
                        </button>
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Advice Card */}
                        <div className="card-white" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '2.5rem', marginBottom: '2rem', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                                        <CheckCircle size={16} color="#34d399" /> CHECK-IN COMPLETE
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{advice.title}</h3>
                                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '500px' }}>
                                        {advice.text}
                                    </p>
                                    <button style={{ padding: '10px 20px', background: 'white', color: '#1e293b', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                        {advice.action}
                                    </button>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                                    <Sparkles size={40} color="#fbbf24" />
                                </div>
                            </div>
                        </div>

                        {/* Resources Section */}
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', color: '#1e293b' }}>Recommended Resources</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {resources.map((res, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="card-white"
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                                        <div style={{ background: `${res.color}15`, padding: '12px', borderRadius: '12px', color: res.color }}>
                                            <res.icon size={24} />
                                        </div>
                                        <div style={{ fontWeight: '700' }}>{res.title}</div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', flex: 1, marginBottom: '1.5rem' }}>{res.description}</p>
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: res.color }}>{res.contact}</span>
                                        <ChevronRight size={16} color="#94a3b8" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => { setStep('mood'); setMood(null); }}
                            style={{ display: 'block', margin: '3rem auto 0 auto', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Reset Wellness Check
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WellnessCheck;
