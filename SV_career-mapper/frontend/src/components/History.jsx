import React, { useState, useEffect } from 'react';
import api from '../api';
import { MessageSquare, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const History = ({ onSelectSession }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/api/chat/history/sessions');
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this conversation?")) return;

        try {
            await api.delete(`/api/chat/history/${id}`);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const filteredSessions = sessions.filter(s =>
        (s.title && s.title.toLowerCase().includes(search.toLowerCase())) ||
        (s.id && s.id.toString().includes(search))
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Conversation History</h2>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', paddingLeft: '2rem' }}
                    />
                    <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>

            {loading ? (
                <div>Loading history...</div>
            ) : filteredSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>{search ? 'No matching conversations found.' : 'No past conversations found.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredSessions.map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card-white"
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1.25rem',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => onSelectSession(session.id)}
                            whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '50%', color: '#4f46e5', marginRight: '1rem' }}>
                                <MessageSquare size={20} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '4px' }}>
                                    {session.title || "Untitled Conversation"}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} />
                                    {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleDelete(e, session.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    opacity: 0.6,
                                    marginRight: '0.5rem'
                                }}
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>

                            <ChevronRight size={20} color="#cbd5e1" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
