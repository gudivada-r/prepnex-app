import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const BookAdvisor = ({ onBack }) => {
    const [advisorList, setAdvisorList] = useState([]);
    const [loadingAdvisors, setLoadingAdvisors] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [formData, setFormData] = useState({
        advisor_name: '',
        date: '',
        time: '',
        reason: ''
    });
    const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [responseMsg, setResponseMsg] = useState('');

    useEffect(() => {
        const fetchAdvisors = async () => {
            setLoadingAdvisors(true);
            try {
                const response = await api.get('/api/advisors');
                setAdvisorList(response.data);
                setFetchError(null);
            } catch (error) {
                console.error("Failed to fetch advisors", error);
                setFetchError("Unable to load advisors at this time.");
            } finally {
                setLoadingAdvisors(false);
            }
        };
        fetchAdvisors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdvisorSelect = (name) => {
        setFormData(prev => ({ ...prev, advisor_name: name }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await api.post('/api/schedule/book', formData);

            setStatus('success');
            setResponseMsg(response.data.details || 'Appointment Confirmed!');
        } catch (error) {
            setStatus('error');
            setResponseMsg(error.response?.data?.detail || 'Failed to book appointment.');
        }
    };

    if (status === 'success') {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ background: '#dcfce7', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <CheckCircle size={64} color="#16a34a" />
                </motion.div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Booking Confirmed!</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
                    {responseMsg}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => { setStatus(null); setFormData({ advisor_name: '', date: '', time: '', reason: '' }); }}

                        style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                        Book Another
                    </button>
                    <button
                        onClick={onBack}
                        style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem' }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="card-white">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar className="text-primary" /> Book an Advisor
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>

                        {/* Advisor Selection */}
                        <div>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#1e293b' }}>Select Advisor</label>

                            {loadingAdvisors && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading advisors...</div>
                            )}

                            {fetchError && (
                                <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
                                    {fetchError}
                                </div>
                            )}

                            {!loadingAdvisors && !fetchError && advisorList.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                                    No advisors are currently available.
                                </div>
                            )}

                            {!loadingAdvisors && advisorList.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {advisorList.map(advisor => (
                                        <div
                                            key={advisor.id}
                                            onClick={() => handleAdvisorSelect(advisor.name)}
                                            style={{
                                                padding: '1rem',
                                                border: `2px solid ${formData.advisor_name === advisor.name ? '#4f46e5' : '#e2e8f0'}`,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                background: formData.advisor_name === advisor.name ? '#eef2ff' : 'white',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: '600' }}>{advisor.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{advisor.availability}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#4f46e5', marginTop: '4px' }}>{advisor.specialty}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date and Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#1e293b' }}>Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#1e293b' }}>Time</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="time"
                                        name="time"
                                        required
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#1e293b' }}>Reason for Meeting</label>
                            <textarea
                                name="reason"
                                rows="3"
                                placeholder="e.g., Discussing course options for next semester..."
                                value={formData.reason}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
                            />
                        </div>

                        {/* Submit */}
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={status === 'loading' || !formData.advisor_name}
                                style={{
                                    background: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: formData.advisor_name ? 'pointer' : 'not-allowed',
                                    opacity: formData.advisor_name ? 1 : 0.6
                                }}>
                                {status === 'loading' ? 'Confirming...' : 'Confirm Booking'}
                            </button>
                        </div>

                    </div>
                    {status === 'error' && (
                        <div style={{ marginTop: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} /> {responseMsg}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BookAdvisor;
