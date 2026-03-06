import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Search, BookOpen, Star, Calendar, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded tutors removed, using state instead

const TutoringCenter = () => {
    const [view, setView] = useState('browse'); // 'browse', 'sessions', or 'availability'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookedSessions, setBookedSessions] = useState([]);
    const [tutors, setTutors] = useState([]);

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const response = await api.get('/api/tutors');
                // Backend sends subjects as "Sub1, Sub2", frontend expects array
                const formattedTutors = response.data.map(t => ({
                    ...t,
                    subjects: typeof t.subjects === 'string' ? t.subjects.split(',').map(s => s.trim()) : (t.subjects || [])
                }));
                setTutors(formattedTutors);
            } catch (error) {
                console.error("Error fetching tutors:", error);
            }
        };
        fetchTutors();
    }, []);

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

    const tutorAvailability = {
        1: ["09:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "05:00 PM"],
        2: ["10:00 AM", "12:00 PM", "01:00 PM", "04:00 PM", "05:00 PM"],
        3: ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
        4: ["11:00 AM", "01:00 PM", "02:00 PM", "04:00 PM", "05:00 PM"]
    };

    const filteredTutors = tutors.filter(tutor =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleBook = (tutor, slot = null) => {
        setSelectedTutor(tutor);
        setSelectedSlot(slot || "2:00 PM");
    };

    const confirmBooking = () => {
        const newSession = {
            id: Date.now(),
            tutorName: selectedTutor.name,
            tutorColor: selectedTutor.color,
            tutorImage: selectedTutor.image,
            time: selectedSlot || "2:00 PM",
            date: 'Today',
            subject: selectedTutor.subjects[0]
        };

        setBookedSessions([...bookedSessions, newSession]);
        setBookingSuccess(true);

        setTimeout(() => {
            setBookingSuccess(false);
            setSelectedTutor(null);
            setSelectedSlot(null);
            setView('sessions');
        }, 2000);
    };

    const AvailabilityView = () => (
        <div className="card-white" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '1.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', width: '120px' }}>Time</th>
                            {tutors.map(tutor => (
                                <th key={tutor.id} style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: `${tutor.color}20`,
                                            color: tutor.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: '700'
                                        }}>
                                            {tutor.image}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{tutor.name.split(' ')[0]}</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(slot => (
                            <tr key={slot} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.2rem 1.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>
                                    {slot}
                                </td>
                                {tutors.map(tutor => {
                                    const isDefaultAvailable = (tutorAvailability[tutor.id] || []).includes(slot);
                                    const isAlreadBooked = bookedSessions.some(s => s.tutorName === tutor.name && s.time === slot);
                                    const isAvailable = isDefaultAvailable && !isAlreadBooked;

                                    return (
                                        <td key={tutor.id} style={{ padding: '1rem', textAlign: 'center' }}>
                                            {isAvailable ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleBook(tutor, slot)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: '#dcfce7',
                                                        color: '#166534',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        maxWidth: '100px'
                                                    }}
                                                >
                                                    Book
                                                </motion.button>
                                            ) : isAlreadBooked ? (
                                                <div style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: '#f1f5f9',
                                                    color: '#94a3b8',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    width: '100%',
                                                    maxWidth: '100px'
                                                }}>
                                                    Booked
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#dcfce7', border: '1px solid #bdf2d0' }}></div>
                    Available for Booking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9' }}></div>
                    Already Booked
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Tutoring Center</h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Personalized support across all your courses</p>
                </div>
                <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {[
                        { id: 'browse', label: 'Browse Tutors' },
                        { id: 'availability', label: 'Wholistic View' },
                        { id: 'sessions', label: `My Sessions ${bookedSessions.length > 0 ? `(${bookedSessions.length})` : ''}` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: view === tab.id ? '#f1f5f9' : 'transparent',
                                color: view === tab.id ? '#4f46e5' : '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'browse' && (
                        <>
                            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by subject or tutor name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 48px',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {filteredTutors.map((tutor) => (
                                    <motion.div
                                        layoutId={`tutor-${tutor.id}`}
                                        key={tutor.id}
                                        className="card-white"
                                        whileHover={{ y: -5 }}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleBook(tutor)}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '15px',
                                                background: `${tutor.color}20`,
                                                color: tutor.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2rem',
                                                fontWeight: '700'
                                            }}>
                                                {tutor.image}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{tutor.name}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#f59e0b', marginTop: '4px' }}>
                                                    <Star size={14} fill="#f59e0b" /> {tutor.rating} <span style={{ color: '#94a3b8' }}>({tutor.reviews} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                                            {tutor.subjects.map((sub, i) => (
                                                <span key={i} style={{ padding: '4px 10px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #f1f5f9' }}>{sub}</span>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '600' }}>Available Today</div>
                                            <ChevronRight size={18} color="#94a3b8" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}

                    {view === 'availability' && <AvailabilityView />}

                    {view === 'sessions' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {bookedSessions.length > 0 ? (
                                bookedSessions.map(session => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={session.id}
                                        className="card-white"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: `${session.tutorColor}20`,
                                                color: session.tutorColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                fontWeight: '700'
                                            }}>
                                                {session.tutorImage}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700' }}>{session.tutorName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{session.subject} • {session.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '600', color: '#4f46e5' }}>{session.time}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Confirmed</div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="card-white" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                    <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                        <Calendar size={32} color="#94a3b8" />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>No sessions scheduled</h3>
                                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto 2rem auto' }}>Book a session with one of our expert tutors to get started on your success path.</p>
                                    <button
                                        onClick={() => setView('browse')}
                                        style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Find a Tutor
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Booking Modal Overlay */}
            <AnimatePresence>
                {selectedTutor && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="card-white"
                            style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
                        >
                            {!bookingSuccess ? (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '20px',
                                            background: `${selectedTutor.color}20`,
                                            color: selectedTutor.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.8rem',
                                            fontWeight: '700',
                                            margin: '0 auto 1rem auto'
                                        }}>
                                            {selectedTutor.image}
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Book {selectedTutor.name}</h3>
                                        <p style={{ color: '#64748b' }}>Expert in {selectedTutor.subjects.join(', ')}</p>
                                    </div>

                                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Select Date</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                                {['Today', 'Tomorrow', 'Oct 29'].map((d, i) => (
                                                    <div key={i} style={{ padding: '10px', textAlign: 'center', border: i === 0 ? '2px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', background: i === 0 ? '#eef2ff' : 'white', fontSize: '0.9rem', fontWeight: i === 0 ? '600' : '400' }}>
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Selected Time Slot</label>
                                            <div style={{ padding: '12px', textAlign: 'center', border: '2px solid #4f46e5', borderRadius: '10px', background: '#eef2ff', fontSize: '1rem', fontWeight: '600' }}>
                                                <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> {selectedSlot || "2:00 PM"}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedTutor(null)}
                                            style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmBooking}
                                            style={{ flex: 1, padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Confirm Booking
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}
                                    >
                                        <CheckCircle size={40} color="#16a34a" />
                                    </motion.div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Session Booked!</h3>
                                    <p style={{ color: '#64748b' }}>Check your email for the session link.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TutoringCenter;
