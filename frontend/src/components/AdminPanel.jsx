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

            <div className="card-white">
                {activeSection === 'advisors' ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <h3>Advisor Management</h3>
                        <p>Functionality to add/edit Advisors will act as a placeholder for now.</p>
                        {/* Future implementation: List Advisors + Add Button + Form */}
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <h3>Tutor Management</h3>
                        <p>Functionality to add/edit Tutors will act as a placeholder for now.</p>
                        {/* Future implementation: List Tutors + Add Button + Form */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
