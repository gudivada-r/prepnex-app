
import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = ({ onBack }) => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>← Back</button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Privacy Policy</h1>
        <div className="card-white" style={{ lineHeight: '1.6', color: '#334155' }}>
            <p><strong>Effective Date:</strong> January 1, 2025</p>
            <p>At Student Success Navigator, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>1. Information We Collect</h3>
            <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>Account Information:</strong> Name, email address, and student ID.</li>
                <li><strong>Academic Data:</strong> Courses, grades, and assignments synced from your LMS (Canvas).</li>
                <li><strong>Usage Data:</strong> Interactions with our AI features and chat logs.</li>
            </ul>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>2. How We Use Your Information</h3>
            <p>We use your data to:</p>
            <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Provide personalized academic insights and reminders.</li>
                <li>Facilitate tutoring and scheduling services.</li>
                <li>Improve our AI models and user experience.</li>
            </ul>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>3. Data Protection</h3>
            <p>We implement industry-standard security measures to encrypt and protect your data. We do not sell your personal information to third parties.</p>

            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>4. Contact Us</h3>
            <p>If you have questions about this policy, please contact support@studentsuccess.edu.</p>
        </div>
    </div>
);

export default PrivacyPolicy;
