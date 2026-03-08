import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, HelpCircle, ChevronDown, ChevronUp, ArrowLeft, GraduationCap } from 'lucide-react';
import logoAsset from '../assets/logo.png';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1.5rem 0' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>{question}</span>
                {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
            </button>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ overflow: 'hidden', marginTop: '1rem', color: '#64748b', lineHeight: '1.6' }}
                >
                    {answer}
                </motion.div>
            )}
        </div>
    );
};

const Support = ({ onBack }) => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={logoAsset} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Support Center</h1>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                    )}
                </div>

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>How can we help you?</h2>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        We're here to support your academic journey. Browse our FAQs or get in touch with our student success team.
                    </p>
                </div>

                {/* Contact Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ background: '#eef2ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Mail size={24} color="#4f46e5" />
                        </div>
                        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Email Support</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Get a response within 24 hours.</p>
                        <a href="mailto:support@aumtech.ai" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>support@aumtech.ai</a>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ background: '#f0fdf4', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <MessageCircle size={24} color="#10b981" />
                        </div>
                        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Chat with AI</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Instant answers from the Navigator.</p>
                        <button onClick={() => onBack && onBack('chat')} style={{ border: 'none', background: 'none', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}>Open Get Aura</button>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ background: '#fff7ed', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Phone size={24} color="#f59e0b" />
                        </div>
                        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Office Hours</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Mon-Fri, 9am - 5pm EST.</p>
                        <span style={{ color: '#f59e0b', fontWeight: '600' }}>+1 (555) SUCCESS</span>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HelpCircle color="#4f46e5" /> Frequently Asked Questions
                    </h3>
                    <FAQItem
                        question="How does the Get Aura help me?"
                        answer="The Get Aura uses Student Success AI to analyze your academic profile, syllabi, and goals. It can suggest study plans, explain complex concepts, and guide you through administrative processes."
                    />
                    <FAQItem
                        question="Is my academic data secure?"
                        answer="Absolutely. We use enterprise-grade encryption to protect all your data. Your academic records are only used to provide you with personalized recommendations."
                    />
                    <FAQItem
                        question="Can I sync with my university LMS?"
                        answer="Yes, Student Success Navigator supports integration with Canvas and Blackboard. Go to Settings to connect your accounts."
                    />
                    <FAQItem
                        question="How do I resolve a hold on my account?"
                        answer="Navigate to the 'Holds & Alerts' section. There you'll find a detailed explanation of each hold and specific actions you can take to resolve them."
                    />
                </div>

                {/* Contact Form */}
                <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '24px', color: 'white' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ background: '#10b981', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <MessageCircle size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Message Sent!</h3>
                            <p style={{ color: '#94a3b8' }}>Thank you for reaching out. A student success specialist will contact you shortly.</p>
                            <button onClick={() => setSubmitted(false)} style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Send another message</button>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Send us a message</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#94a3b8' }}>Name</label>
                                        <input required type="text" placeholder="Your name" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#94a3b8' }}>Email</label>
                                        <input required type="email" placeholder="Your email" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#94a3b8' }}>Subject</label>
                                    <select style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                        <option>Technical Issue</option>
                                        <option>Academic Advice</option>
                                        <option>Financial Aid Question</option>
                                        <option>Feedback</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#94a3b8' }}>Message</label>
                                    <textarea required rows="4" placeholder="How can we help you today?" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none' }}></textarea>
                                </div>
                                <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Send Message</button>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer Disclaimer */}
                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <p>© 2026 Student Success Navigator | www.aumtech.ai. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Support;
