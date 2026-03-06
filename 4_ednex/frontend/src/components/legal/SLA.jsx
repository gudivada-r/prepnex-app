
import React from 'react';

const SLA = ({ onBack }) => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>← Back</button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Service Level Agreement (SLA)</h1>
        <div className="card-white" style={{ lineHeight: '1.6', color: '#334155' }}>
            <p><strong>Effective Date:</strong> January 1, 2025</p>
            <p>This Service Level Agreement defines the expected level of service for the Student Success Navigator platform.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>1. Uptime Commitment</h3>
            <p>We commit to maintaining a Service Availability of at least 99.5% during each calendar month, excluding scheduled maintenance.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>2. Support Response Times</h3>
            <p>Our support team aims to respond to critical issues within 4 hours and non-critical inquiries within 24 hours during business days.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>3. Scheduled Maintenance</h3>
            <p>We will provide at least 48 hours notice for any scheduled maintenance that may impact service availability. Maintenance will typically be performed during off-peak hours.</p>
        </div>
    </div>
);

export default SLA;
