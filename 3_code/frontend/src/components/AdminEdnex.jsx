import React, { useState, useEffect } from 'react';
import api from '../api';
import { Network, Database, UserSearch, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminEdnex = () => {
    const [activeTab, setActiveTab] = useState('config'); // config, status, lookup
    const [loading, setLoading] = useState(false);

    // Config state
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [configStatus, setConfigStatus] = useState(null);

    // Status state
    const [healthData, setHealthData] = useState(null);

    // Lookup state
    const [searchQuery, setSearchQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [lookupError, setLookupError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        if (activeTab === 'config') checkConfig();
        if (activeTab === 'status') fetchHealth();
    }, [activeTab]);

    const checkConfig = async () => {
        try {
            const res = await api.get('/api/ednex/config');
            setConfigStatus(res.data);
        } catch (e) {
            console.error("Failed to check config", e);
        }
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/ednex/config', { url: supabaseUrl, key: supabaseKey });
            setConfigStatus({ configured: true, source: 'db' });
            setSupabaseUrl('');
            setSupabaseKey('');
            alert("Configuration saved successfully.");
        } catch (e) {
            alert("Failed to save configuration.");
        } finally {
            setLoading(false);
        }
    };

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/ednex/health');
            setHealthData(res.data.modules);
        } catch (e) {
            console.error("Health check failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLookupError('');
        setUserData(null);
        setSelectedStudent(null);
        try {
            const res = await api.get(`/api/ednex/user/search/${encodeURIComponent(searchQuery)}`);
            setUserData(res.data);
            if (res.data && res.data.results && res.data.results.length === 1) {
                setSelectedStudent(res.data.results[0]);
            }
        } catch (e) {
            setLookupError(e.response?.data?.detail || "No matching students found or error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Network color="#4f46e5" /> EdNex Integration Hub
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Configure and monitor the connection to the core EdNex Data Warehouse (Supabase).</p>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('config')}
                    style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'config' ? 'bold' : 'normal', color: activeTab === 'config' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'config' ? '2px solid #4f46e5' : 'none', cursor: 'pointer' }}
                >
                    <Database size={16} style={{ marginBottom: '-2px', marginRight: '5px' }} /> Connection Setup
                </button>
                <button
                    onClick={() => setActiveTab('status')}
                    style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'status' ? 'bold' : 'normal', color: activeTab === 'status' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'status' ? '2px solid #4f46e5' : 'none', cursor: 'pointer' }}
                >
                    <RefreshCw size={16} style={{ marginBottom: '-2px', marginRight: '5px' }} /> Module Status
                </button>
                <button
                    onClick={() => setActiveTab('lookup')}
                    style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'lookup' ? 'bold' : 'normal', color: activeTab === 'lookup' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'lookup' ? '2px solid #4f46e5' : 'none', cursor: 'pointer' }}
                >
                    <UserSearch size={16} style={{ marginBottom: '-2px', marginRight: '5px' }} /> User Lookup
                </button>
            </div>

            {/* TAB: CONFIG */}
            {activeTab === 'config' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h3>Connection Status</h3>
                        {configStatus === null ? <p>Checking...</p> : configStatus.configured ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginTop: '1rem', fontWeight: 'bold' }}>
                                <CheckCircle2 /> Connected to EdNex (Source: {configStatus.source})
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginTop: '1rem', fontWeight: 'bold' }}>
                                <AlertCircle /> Disconnected
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Update Credentials</h3>
                        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Supabase URL</label>
                                <input
                                    type="text"
                                    value={supabaseUrl}
                                    onChange={(e) => setSupabaseUrl(e.target.value)}
                                    placeholder="https://xxxx.supabase.co"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Supabase Service Key (or Anon Key)</label>
                                <input
                                    type="password"
                                    value={supabaseKey}
                                    onChange={(e) => setSupabaseKey(e.target.value)}
                                    placeholder="eyJh..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} style={{ background: '#4f46e5', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}>
                                {loading ? 'Saving...' : <><Save size={18} /> Save & Connect</>}
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}

            {/* TAB: STATUS */}
            {activeTab === 'status' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>EdNex Module Health</h3>
                        <button onClick={fetchHealth} disabled={loading} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {loading && !healthData ? <p>Loading system health...</p> : null}

                    {healthData && (
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 'bold' }}>Module Name</th>
                                        <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 'bold', textAlign: 'right' }}>Total Records</th>
                                        <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 'bold', textAlign: 'center' }}>Health Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(healthData).map(([moduleName, info], idx) => (
                                        <tr key={moduleName} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                            <td style={{ padding: '15px 20px', fontWeight: '500', color: '#1e293b' }}>{moduleName}</td>
                                            <td style={{ padding: '15px 20px', fontWeight: 'bold', textAlign: 'right', color: '#334155' }}>{info.count.toLocaleString()}</td>
                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                <span style={{
                                                    color: info.status.includes('Operational') ? '#16a34a' : '#dc2626',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    background: info.status.includes('Operational') ? '#dcfce7' : '#fee2e2',
                                                    display: 'inline-block'
                                                }}>
                                                    {info.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            {/* TAB: LOOKUP */}
            {activeTab === 'lookup' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Cross-Module Student Lookup</h3>
                        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or department..."
                                style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                            <button type="submit" disabled={loading} style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                {loading ? 'Searching...' : 'Lookup'}
                            </button>
                        </form>
                        {lookupError && <p style={{ color: '#dc2626', marginTop: '1rem' }}>{lookupError}</p>}
                    </div>

                    {userData && userData.results && !selectedStudent && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            <h4 style={{ gridColumn: '1 / -1', marginBottom: 0 }}>Found {userData.results.length} student(s) matching '{searchQuery}'</h4>
                            {userData.results.map((student, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedStudent(student)}
                                    style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{ background: '#e0e7ff', color: '#4338ca', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#1e293b' }}>{student.name}</h4>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{student.email}</p>
                                        </div>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>ID: {student.ednex_student_id.substring(0, 8)}...</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedStudent && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: '#e0e7ff', color: '#4338ca', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            {selectedStudent.name.charAt(0)}
                                        </div>
                                        {selectedStudent.name}
                                    </h2>
                                    <p style={{ margin: '5px 0 0 58px', color: '#64748b', fontSize: '1rem' }}>{selectedStudent.email} • ID: {selectedStudent.ednex_student_id}</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                                    ← Back to Results
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Identity Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Core Identity</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', fontSize: '0.9rem' }}>
                                        <div style={{ color: '#64748b' }}>Role:</div><div>{selectedStudent.modules.mod00_users?.role}</div>
                                        <div style={{ color: '#64748b' }}>Status:</div>
                                        <div>
                                            <span style={{ background: selectedStudent.modules.mod00_users?.is_active ? '#dcfce7' : '#fee2e2', color: selectedStudent.modules.mod00_users?.is_active ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {selectedStudent.modules.mod00_users?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div style={{ color: '#64748b' }}>Created:</div><div>{new Date(selectedStudent.modules.mod00_users?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                {/* SIS Profile Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>SIS Academic Profile</h4>
                                    {selectedStudent.modules.mod01_student_profiles ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', fontSize: '0.9rem' }}>
                                            <div style={{ color: '#64748b' }}>External ID:</div><div>{selectedStudent.modules.mod01_student_profiles.external_student_id}</div>
                                            <div style={{ color: '#64748b' }}>Status:</div><div>{selectedStudent.modules.mod01_student_profiles.enrollment_status}</div>
                                            <div style={{ color: '#64748b' }}>Cum. GPA:</div><div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedStudent.modules.mod01_student_profiles.cumulative_gpa}</div>
                                            <div style={{ color: '#64748b' }}>Credits:</div><div>{selectedStudent.modules.mod01_student_profiles.credits_earned || selectedStudent.modules.mod01_student_profiles.total_units_earned || 0}</div>
                                            <div style={{ color: '#64748b' }}>Standing:</div><div>{selectedStudent.modules.mod01_student_profiles.academic_standing || 'Normal'}</div>
                                            <div style={{ color: '#64748b' }}>DOB:</div><div>{selectedStudent.modules.mod01_student_profiles.dob ? new Date(selectedStudent.modules.mod01_student_profiles.dob).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No SIS profile found.</p>
                                    )}
                                </div>

                                {/* Financial Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Financial Account</h4>
                                    {selectedStudent.modules.mod02_student_accounts ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', fontSize: '0.9rem' }}>
                                            <div style={{ color: '#64748b' }}>Tuition Bal:</div><div style={{ color: '#dc2626', fontWeight: 'bold' }}>${selectedStudent.modules.mod02_student_accounts.tuition_balance}</div>
                                            <div style={{ color: '#64748b' }}>Fees Bal:</div><div>${selectedStudent.modules.mod02_student_accounts.fees_balance}</div>
                                            <div style={{ color: '#64748b' }}>Fin Aid:</div><div style={{ color: '#16a34a' }}>${selectedStudent.modules.mod02_student_accounts.financial_aid_award || selectedStudent.modules.mod02_student_accounts.pending_aid || 0}</div>
                                            <div style={{ color: '#64748b' }}>Net Due:</div><div style={{ fontWeight: 'bold' }}>${selectedStudent.modules.mod02_student_accounts.net_amount_due || 0}</div>
                                            <div style={{ color: '#64748b' }}>Bill Date:</div><div>{selectedStudent.modules.mod02_student_accounts.last_bill_date ? new Date(selectedStudent.modules.mod02_student_accounts.last_bill_date).toLocaleDateString() : 'N/A'}</div>
                                            <div style={{ color: '#64748b' }}>Hold:</div>
                                            <div>
                                                {selectedStudent.modules.mod02_student_accounts.has_financial_hold ? (
                                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active Hold</span>
                                                ) : "Clear"}
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No financial account found.</p>
                                    )}
                                </div>

                                {/* Enrollment Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Current Enrollments</h4>
                                    {selectedStudent.modules.mod04_enrollments && selectedStudent.modules.mod04_enrollments.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedStudent.modules.mod04_enrollments.map((e, i) => (
                                                <div key={i} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Section: {e.section_id.substring(0, 8)}</span>
                                                    <span>Grade: <strong style={{ color: '#4f46e5' }}>{e.final_grade || e.midterm_grade || 'N/A'}</strong></span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Not enrolled in any sections.</p>
                                    )}
                                </div>

                                {/* Admissions Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Admission Applications</h4>
                                    {selectedStudent.modules.mod06_admissions_applications && selectedStudent.modules.mod06_admissions_applications.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedStudent.modules.mod06_admissions_applications.map((app, i) => (
                                                <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <strong style={{ color: '#0f172a' }}>{app.app_number}</strong>
                                                        <span style={{ color: '#4f46e5', fontWeight: '600' }}>{app.status}</span>
                                                    </div>
                                                    <div style={{ color: '#64748b' }}>{app.admit_type} • {app.admit_term} • GPA: {app.external_gpa}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No admissions data.</p>
                                    )}
                                </div>

                                {/* Financial Aid Packages Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Financial Aid Packages</h4>
                                    {selectedStudent.modules.mod08_aid_packages && selectedStudent.modules.mod08_aid_packages.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedStudent.modules.mod08_aid_packages.map((pkg, i) => (
                                                <div key={i} style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <strong style={{ color: '#16a34a' }}>Year: {pkg.aid_year}</strong>
                                                        <span style={{ fontWeight: 'bold' }}>{pkg.status}</span>
                                                    </div>
                                                    <div style={{ color: '#166534', fontSize: '0.8rem' }}>
                                                        Offered: ${pkg.total_offered?.toLocaleString() || 0} • Distributed: ${pkg.total_disbursed?.toLocaleString() || 0}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No aid packages found.</p>
                                    )}
                                </div>

                                {/* Contributions Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Institutional Contributions</h4>
                                    {selectedStudent.modules.mod09_contributions && selectedStudent.modules.mod09_contributions.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedStudent.modules.mod09_contributions.map((con, i) => (
                                                <div key={i} style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong style={{ color: '#c2410c' }}>${con.amount?.toLocaleString() || 0}</strong>
                                                        <span style={{ fontSize: '0.75rem', color: '#9a3412' }}>{new Date(con.contribution_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>{con.type}: {con.designation}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No contributions found.</p>
                                    )}
                                </div>

                                {/* Degree Audit Box */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Degree Requirement Audit</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                        {selectedStudent.modules.mod07_degree_audits && selectedStudent.modules.mod07_degree_audits.length > 0 ? (
                                            selectedStudent.modules.mod07_degree_audits.map((audit, i) => (
                                                <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{audit.requirement_name}</span>
                                                        <span style={{ 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 'bold', 
                                                            color: audit.status === 'Met' ? '#16a34a' : audit.status === 'In Progress' ? '#ca8a04' : '#dc2626'
                                                        }}>{audit.status}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        Applied: {JSON.stringify(audit.courses_applied)}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No audit records found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default AdminEdnex;
