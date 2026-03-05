import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    GraduationCap,
    CreditCard,
    PieChart,
    Download,
    Calendar,
    ArrowRight,
    TrendingUp,
    FileText,
    Landmark,
    FileQuestion,
    ExternalLink
} from 'lucide-react';
import ScholarshipMatcher from './ScholarshipMatcher';

const FinancialAidNexus = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: PieChart },
        { id: 'scholarships', label: 'Scholarship Matcher', icon: GraduationCap },
        { id: 'tuition', label: 'Tuition & Billing', icon: CreditCard },
        { id: 'aid', label: 'Grants & Loans', icon: Landmark },
        { id: 'fafsa', label: 'FAFSA Assistant', icon: FileQuestion },
    ];

    // Mock Data for Overview
    const summaryData = {
        totalDue: 4500.00,
        nextPayment: { amount: 1125.00, date: '2025-10-15' },
        aidDisbursed: 12500.00,
        pendingAid: 2500.00
    };

    const renderOverview = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="card-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Balance Due</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>${summaryData.totalDue.toLocaleString()}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', width: 'fit-content' }}>
                        <Calendar size={14} />
                        <span style={{ fontSize: '0.85rem' }}>Next payment of ${summaryData.nextPayment.amount.toLocaleString()} due {new Date(summaryData.nextPayment.date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="card-white">
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Financial Aid (YTD)</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>${summaryData.aidDisbursed.toLocaleString()}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
                        + ${summaryData.pendingAid.toLocaleString()} pending disbursement
                    </div>
                </div>

                <div className="card-white">
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Spending (This Semester)</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b' }}>$684.50</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Books, Supplies, & Dining
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div
                    className="card-white"
                    style={{ cursor: 'pointer', borderLeft: '4px solid #4f46e5' }}
                    onClick={() => setActiveTab('scholarships')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Find Scholarships</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Use our AI Matcher to find opportunities tailored to your profile.</p>
                        </div>
                        <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '50%', color: '#4f46e5' }}>
                            <GraduationCap size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className="card-white"
                    style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
                    onClick={() => setActiveTab('tuition')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Make a Payment</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>View your latest statement and manage payment plans.</p>
                        </div>
                        <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '50%', color: '#10b981' }}>
                            <CreditCard size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTuition = () => (
        <div className="card-white">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Transaction History</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Date</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Term</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { date: '2025-08-15', desc: 'Fall 2025 Tuition', term: 'Fall 2025', amount: 15400.00 },
                            { date: '2025-08-15', desc: 'Campus Life Fee', term: 'Fall 2025', amount: 350.00 },
                            { date: '2025-08-20', desc: 'Pell Grant Disbursement', term: 'Fall 2025', amount: -3698.00 },
                            { date: '2025-09-01', desc: 'Payment - Credit Card', term: 'Fall 2025', amount: -500.00 },
                            { date: '2025-09-15', desc: 'Lab Fee - CS 101', term: 'Fall 2025', amount: 125.00 },
                        ].map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{new Date(item.date).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{item.desc}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.term}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: item.amount > 0 ? '#1e293b' : '#10b981' }}>
                                    {item.amount > 0 ? `$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="pill-btn"><Download size={16} /> Download PDF Statement</button>
            </div>
        </div>
    );

    const renderAid = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="card-white">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Active Grants & Loans</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                        { title: 'Federal Pell Grant', type: 'Grant', amount: 7395, status: 'Active', disbursed: 3697.50 },
                        { title: 'University Merit Scholarship', type: 'Scholarship', amount: 5000, status: 'Active', disbursed: 2500.00 },
                        { title: 'Federal Direct Subsidized Loan', type: 'Loan', amount: 3500, status: 'Accepted', disbursed: 1750.00 },
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.title}</h4>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{item.type} • {item.status}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700' }}>${item.amount.toLocaleString()} / yr</div>
                                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Pd: ${item.disbursed.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFAFSA = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'revert-layer', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '2rem' }}>
                <div className="card-white">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileQuestion color="#4f46e5" /> FAFSA Copilot
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        A step-by-step assistant to help you navigate the Free Application for Federal Student Aid (FAFSA).
                        Completing this form is the key to unlocking federal grants, loans, and work-study funds.
                    </p>

                    <div className="fafsa-steps">
                        {[
                            { step: 1, title: 'Create your StudentAid.gov account (FSA ID)', desc: 'You and your parents will each need one to sign the form electronically.', status: 'completed' },
                            { step: 2, title: 'Gather Required Documents', desc: 'Have your SSN, 2023 Tax Returns (1040), and bank statements ready.', status: 'active' },
                            { step: 3, title: 'Start the 2025-26 FAFSA Form', desc: 'Log in and select "Start New Form". Use School Code 001234.', status: 'pending' },
                            { step: 4, title: 'Review & Sign', desc: 'Ensure all contributors sign the form. This is the most common error!', status: 'pending' },
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', opacity: item.status === 'pending' ? 0.6 : 1 }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: item.status === 'completed' ? '#10b981' : item.status === 'active' ? '#4f46e5' : '#e2e8f0',
                                    color: item.status === 'pending' ? '#94a3b8' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                                }}>
                                    {item.status === 'completed' ? '✓' : item.step}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: item.status === 'active' ? '#1e293b' : 'inherit' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
                                    {item.status === 'active' && (
                                        <button style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                            View Checklist <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card-white" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dfe7fd 100%)', border: '1px solid #bfdbfe' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e3a8a' }}>AI FAFSA Expert</h3>
                        <p style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '1rem', lineHeight: '1.5' }}>
                            Confused by a specific question? Ask our AI expert for instant clarification on tax data, dependency status, or assets.
                        </p>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                            "What do I do if my parents are divorced?"
                        </div>
                        <button onClick={() => onNavigate('chat', 'fafsa')} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Start Chat <TrendingUp size={16} />
                        </button>
                    </div>

                    <div className="card-white" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#f59e0b' }}></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0.5rem' }}>Important Deadlines</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>University Priority</span>
                                <span style={{ fontWeight: '600', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Apr 15, 2025</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>State Deadline</span>
                                <span style={{ fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Jun 30, 2025</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Go to StudentAid.gov <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Financial Nexus</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your tuition, scholarships, and financial health in one place.</p>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === tab.id ? '#4f46e5' : 'white',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'scholarships' && <ScholarshipMatcher />}
                {activeTab === 'tuition' && renderTuition()}
                {activeTab === 'aid' && renderAid()}
                {activeTab === 'fafsa' && renderFAFSA()}
            </motion.div>
        </div>
    );
};

export default FinancialAidNexus;
