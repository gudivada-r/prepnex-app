import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, MinusCircle, Send, CheckCircle, AlertCircle, ChevronLeft, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const DropAddForms = ({ onBack }) => {
    const [requestType, setRequestType] = useState('add'); // 'add' or 'drop'
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        reason: '',
        explanation: ''
    });
    const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseSelect = (course) => {
        setFormData(prev => ({
            ...prev,
            course_name: course.name,
            course_code: course.code
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const submissionData = {
                request_type: requestType,
                course_name: formData.course_name,
                course_code: formData.course_code,
                reason: formData.reason,
                explanation: formData.explanation
            };

            const response = await api.post('/api/forms/submit', submissionData);

            setStatus('success');
            setMessage(response.data.message);

        } catch (error) {
            console.error("Submission failed:", error);
            setStatus('error');
            setMessage(error.response?.data?.detail || "Failed to submit the request. Please try again.");
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
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Request Submitted</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => {
                            setStatus(null);
                            setFormData({ course_name: '', course_code: '', reason: '', explanation: '' });
                        }}
                        style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                        New Request
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
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div className="card-white" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                        <div style={{ background: '#4f46e5', padding: '10px', borderRadius: '12px' }}>
                            <FileText color="white" size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Drop/Add Course</h2>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Official registrar request form</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '4px', borderRadius: '12px' }}>
                        <button
                            onClick={() => { setRequestType('add'); setFormData({ course_name: '', course_code: '', reason: '', explanation: '' }); }}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: requestType === 'add' ? 'white' : 'transparent',
                                color: requestType === 'add' ? '#10b981' : '#64748b',
                                fontWeight: '600',
                                boxShadow: requestType === 'add' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <PlusCircle size={18} /> Add Course
                        </button>
                        <button
                            onClick={() => { setRequestType('drop'); setFormData({ course_name: '', course_code: '', reason: '', explanation: '' }); }}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: requestType === 'drop' ? 'white' : 'transparent',
                                color: requestType === 'drop' ? '#ef4444' : '#64748b',
                                fontWeight: '600',
                                boxShadow: requestType === 'drop' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <MinusCircle size={18} /> Drop Course
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {requestType === 'drop' && (
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Select Course to Drop</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {courses.map(course => (
                                        <div
                                            key={course.id}
                                            onClick={() => handleCourseSelect(course)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: `2px solid ${formData.course_code === course.code ? '#4f46e5' : '#f1f5f9'}`,
                                                background: formData.course_code === course.code ? '#eff6ff' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{course.code}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{course.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {requestType === 'add' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Course Code</label>
                                    <input
                                        type="text"
                                        name="course_code"
                                        placeholder="e.g. CS101"
                                        value={formData.course_code}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Course Name</label>
                                    <input
                                        type="text"
                                        name="course_name"
                                        placeholder="e.g. Intro to CS"
                                        value={formData.course_name}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Reason for {requestType === 'add' ? 'Adding' : 'Dropping'}</label>
                            <select
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                            >
                                <option value="">Select a reason...</option>
                                {requestType === 'add' ? (
                                    <>
                                        <option value="interest">Personal Interest</option>
                                        <option value="requirement">Degree Requirement</option>
                                        <option value="career">Career Goal</option>
                                        <option value="other">Other</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="workload">Excessive Workload</option>
                                        <option value="schedule">Schedule Conflict</option>
                                        <option value="personal">Personal Reasons</option>
                                        <option value="interest">Loss of Interest</option>
                                        <option value="other">Other</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Additional Explanation</label>
                            <textarea
                                name="explanation"
                                rows="4"
                                placeholder="Please provide more details about your request..."
                                value={formData.explanation}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                            <AlertCircle size={20} color="#d97706" />
                            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                                <strong>Deadline: October 15, 2025.</strong> Requests after this date require dean approval.
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                background: requestType === 'add' ? '#10b981' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: `0 10px 15px -3px ${requestType === 'add' ? '#10b981' : '#ef4444'}40`
                            }}
                        >
                            {status === 'loading' ? 'Processing...' : (
                                <>
                                    <Send size={18} /> Submit {requestType === 'add' ? 'Add' : 'Drop'} Request
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card-white" style={{ background: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontWeight: '700' }}>Instructions</h4>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Ensure you have no hold on your account.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Check for prerequisite requirements before adding.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Dropping below 12 credits may affect financial aid.</li>
                            <li>Requests are typically processed within 24-48 hours.</li>
                        </ul>
                    </div>

                    <div className="card-white">
                        <h4 style={{ margin: '0 0 1rem 0', fontWeight: '700' }}>Quick Help</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ color: '#4f46e5' }}><BookOpen size={18} /></div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Course Catalog</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>View available sections</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ color: '#10b981' }}><Clock size={18} /></div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Processing Time</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Check current queue status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropAddForms;
