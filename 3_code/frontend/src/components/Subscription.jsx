import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, CreditCard } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { getRevenueCatOfferings, purchaseRevenueCatPackage } from '../iap';
import api from '../api';

const Subscription = ({ userData, onBack }) => {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ display: 'inline-flex', padding: '8px 16px', background: '#e0e7ff', color: '#4338ca', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' }}
                >
                    INSTITUTIONAL ACCESS
                </motion.div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Free for Every Student
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Aura is now provided free of charge to students through university-wide licensing.
                </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ background: '#22c55e', color: 'white', padding: '6px', borderRadius: '50%' }}>
                    <Shield size={20} />
                </div>
                <span style={{ color: '#15803d', fontWeight: '700', fontSize: '1.1rem' }}>
                    Your account is enabled via your institution's license. All features are unlocked.
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                {/* Full Access Card */}
                <motion.div
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                    className="card-white"
                    style={{ border: '2px solid #4f46e5', position: 'relative', background: 'white', gridColumn: '1 / -1' }}
                >
                    <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: 'white', padding: '6px 20px', borderRadius: '25px', fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}>
                        UNIVERSITY LICENSED
                    </div>

                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Full Premium Access</h3>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Enjoy the complete Student Success AI suite at no cost to you.</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#1e293b' }}>$0.00</span>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>/ student</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> Unlimited Get Aura</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> Unlimited Syllabus Parsing</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> Priority Tutoring</li>
                        </ul>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Check size={20} color="#10b981" /> Career Mapper</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Check size={20} color="#10b981" /> Wellness Insights</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Check size={20} color="#10b981" /> Institutional Analytics</li>
                        </ul>
                    </div>

                    <button
                        onClick={onBack}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.2s',
                        }}
                    >
                        Success Dashboard
                        <ChevronRight size={20} />
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1.5rem' }}>Provided by your University Student Affairs division. No individual subscription required.</p>
                </motion.div>
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
                    Need help with your institutional access?
                </p>
                <button onClick={() => window.location.href='mailto:support@aumtech.ai'} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', color: '#1e293b', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    Contact Support
                </button>
            </div>
        </div >
    );
};



export default Subscription;
