
import React from 'react';

const MSA = ({ onBack }) => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>← Back</button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Master Services Agreement (MSA)</h1>
        <div className="card-white" style={{ lineHeight: '1.6', color: '#334155' }}>
            <p><strong>Last Updated:</strong> January 1, 2025</p>
            <p>This Master Services Agreement ("Agreement") governs your use of the Student Success Navigator platform.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>1. Services</h3>
            <p>We agree to provide the access to the Student Success Navigator platform, including its AI-driven insights, dashboard, and scheduling tools, subject to the terms of this Agreement.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>2. User Obligations</h3>
            <p>You agree to:</p>
            <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Provide accurate information during registration.</li>
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Use the services only for lawful academic purposes.</li>
            </ul>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>3. Intellectual Property</h3>
            <p>All rights, title, and interest in the platform and its content (excluding your user data) remain with Student Success Inc.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>4. Termination</h3>
            <p>We reserve the right to suspend or terminate your access to the services if you violate any terms of this Agreement.</p>
        </div>
    </div>
);

export default MSA;
