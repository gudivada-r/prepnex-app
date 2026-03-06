import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Briefcase } from 'lucide-react';
import api from '../api';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('advisors'); // 'advisors' or 'tutors'

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Panel</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveSection('advisors')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'advisors' ? '#4f46e5' : 'white',
                        color: activeSection === 'advisors' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'advisors' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
                    }}
                >
                    <Briefcase size={18} /> Manage Advisors
                </button>
                <button
                    onClick={() => setActiveSection('tutors')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === 'tutors' ? '#4f46e5' : 'white',
                        color: activeSection === 'tutors' ? 'white' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: activeSection === 'tutors' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
                    }}
                >
                    <Users size={18} /> Manage Tutors
                </button>
            </div>

            <div className="card-white" style={{ minHeight: '400px' }}>
                {activeSection === 'advisors' ? (
                    <AdvisorsManager />
                ) : (
                    <TutorsManager />
                )}
            </div>
        </div>
    );
};

const AdvisorsManager = () => {
    const [advisors, setAdvisors] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdvisor, setNewAdvisor] = useState({ name: '', specialty: 'General', availability: 'Mon-Fri 9-5', email: '' });

    useEffect(() => {
        fetchAdvisors();
    }, []);

    const fetchAdvisors = async () => {
        try {
            const res = await api.get('/api/advisors');
            setAdvisors(res.data);
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this advisor?")) return;
        try {
            await api.delete(`/api/advisors/${id}`);
            setAdvisors(prev => prev.filter(a => a.id !== id));
        } catch (error) { alert("Failed to delete"); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/advisors', newAdvisor);
            setIsAdding(false);
            setNewAdvisor({ name: '', specialty: 'General', availability: 'Mon-Fri 9-5', email: '' });
            fetchAdvisors();
        } catch (error) { alert("Failed to add advisor"); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                <h3 style={{ margin: 0 }}>Advisor Management</h3>
                <button onClick={() => setIsAdding(true)} className="pill-btn" style={{ background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Plus size={16} style={{ verticalAlign: 'middle' }} /> Add Advisor
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input required placeholder="Name" value={newAdvisor.name} onChange={e => setNewAdvisor({ ...newAdvisor, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Specialty" value={newAdvisor.specialty} onChange={e => setNewAdvisor({ ...newAdvisor, specialty: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Availability" value={newAdvisor.availability} onChange={e => setNewAdvisor({ ...newAdvisor, availability: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Email" value={newAdvisor.email} onChange={e => setNewAdvisor({ ...newAdvisor, email: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </form>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Specialty</th>
                        <th style={{ padding: '1rem' }}>Availability</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {advisors.map(adv => (
                        <tr key={adv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{adv.name}</td>
                            <td style={{ padding: '1rem' }}>{adv.specialty}</td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{adv.availability}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button onClick={() => handleDelete(adv.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TutorsManager = () => {
    const [tutors, setTutors] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTutor, setNewTutor] = useState({ name: '', subjects: 'Math', rating: 5.0, reviews: 0, image: '', color: '#4f46e5' });

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            const res = await api.get('/api/tutors');
            setTutors(res.data);
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this tutor?")) return;
        try {
            await api.delete(`/api/tutors/${id}`);
            setTutors(prev => prev.filter(t => t.id !== id));
        } catch (error) { alert("Failed to delete"); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/tutors', newTutor);
            setIsAdding(false);
            setNewTutor({ name: '', subjects: 'Math', rating: 5.0, reviews: 0, image: '', color: '#4f46e5' });
            fetchTutors();
        } catch (error) { alert("Failed to add tutor"); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                <h3 style={{ margin: 0 }}>Tutor Management</h3>
                <button onClick={() => setIsAdding(true)} className="pill-btn" style={{ background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Plus size={16} style={{ verticalAlign: 'middle' }} /> Add Tutor
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input required placeholder="Name" value={newTutor.name} onChange={e => setNewTutor({ ...newTutor, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Subjects (comma sep)" value={newTutor.subjects} onChange={e => setNewTutor({ ...newTutor, subjects: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input required placeholder="Color (Hex)" value={newTutor.color} onChange={e => setNewTutor({ ...newTutor, color: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </form>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Subjects</th>
                        <th style={{ padding: '1rem' }}>Color</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tutors.map(tutor => (
                        <tr key={tutor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{tutor.name}</td>
                            <td style={{ padding: '1rem' }}>{tutor.subjects}</td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tutor.color }}></div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button onClick={() => handleDelete(tutor.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
