
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Database } from 'lucide-react';
import { motion } from 'framer-motion';

// API Base URL
const API_BASE = '/api';

const CIPExplorer = () => {
    const [cipCodes, setCipCodes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    // Initial load
    useEffect(() => {
        fetchCodes();
    }, []);

    // Search debounce could be added, but simple effect works for now
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCodes(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCodes = async (query = '') => {
        setLoading(true);
        try {
            const url = query
                ? `${API_BASE}/cip?search=${encodeURIComponent(query)}`
                : `${API_BASE}/cip`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCipCodes(data);
            }
        } catch (e) {
            console.error("Fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm("This will scrape the Texas Higher Ed website and populate the database. It may take a few seconds. Continue?")) return;
        setSeeding(true);
        try {
            const res = await fetch(`${API_BASE}/cip/refresh`, { method: 'POST' });
            const result = await res.json();
            alert(`Database Updated!\nAdded: ${result.added}\nTotal: ${result.total}`);
            fetchCodes(search);
        } catch (e) {
            alert("Failed to seed database: " + e.message);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                        CIP Codes
                    </h1>
                    <p style={{ color: '#64748b' }}>Classification of Instructional Programs (Texas 2020)</p>
                </div>
                <button
                    onClick={handleSeed}
                    disabled={seeding}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.75rem 1.5rem',
                        background: seeding ? '#94a3b8' : '#2563eb',
                        color: 'white', border: 'none', borderRadius: '8px',
                        cursor: seeding ? 'not-allowed' : 'pointer'
                    }}
                >
                    {seeding ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                    {seeding ? 'Syncing...' : 'Sync Database'}
                </button>
            </div>

            <div className="card-white" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <Search className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Code or Title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', color: '#64748b' }}>Code</th>
                                <th style={{ padding: '1rem', color: '#64748b' }}>Program Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</td>
                                </tr>
                            ) : cipCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No codes found. {search ? 'Try a different search.' : 'Click "Sync Database" to populate data.'}
                                    </td>
                                </tr>
                            ) : (
                                cipCodes.map((cip) => (
                                    <tr key={cip.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'mono', fontFamily: 'monospace', color: '#2563eb' }}>{cip.code}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{cip.title}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
                    Showing {cipCodes.length} results
                </div>
            </div>
        </div>
    );
};

export default CIPExplorer;
