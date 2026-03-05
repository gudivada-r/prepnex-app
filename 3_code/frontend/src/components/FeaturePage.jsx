import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, Clock, Bot, ArrowRight, BrainCircuit } from 'lucide-react';
import logoAsset from '../assets/logo.png';

const featureData = {
    'syllabus-scanner': {
        title: "AI Syllabus Scanner & Academic Planner",
        subtitle: "Instantly convert unstructured PDF syllabi into an organized, trackable schedule.",
        heroText: "Stop manually entering due dates. Aumtech.ai extracts reading assignments, exam dates, and grading weights directly from your syllabus.",
        icon: <BookOpen size={40} color="#6366f1" />,
        benefits: ["Automated Deadline Tracking", "Grade Weight Calculation", "Calendar Export"]
    },
    'wellness-check': {
        title: "Student Wellness & Burnout Prevention AI",
        subtitle: "Your mental health matters just as much as your GPA.",
        heroText: "Our Wellness Check AI analyzes your workload density and study habits, prompting you when it's time to take a break or access campus counseling.",
        icon: <ShieldCheck size={40} color="#10b981" />,
        benefits: ["Burnout Forecasting", "Guided Breathing", "Campus Resource Linking"]
    },
    'ai-tutor': {
        title: "24/7 AI Tutor & Concept Explainer",
        subtitle: "Never get stuck on an assignment at 2 AM again.",
        heroText: "The Student Success Navigator includes a context-aware AI tutor. Whether it's Calculus or Psychology, get step-by-step explanations.",
        icon: <Bot size={40} color="#f59e0b" />,
        benefits: ["Socratic Questioning", "Upload Class Notes", "Homework Help"]
    },
    'gpa-predictor': {
        title: "GPA Tracker & Academic Forecasting",
        subtitle: "Know exactly what you need on the final to get an A.",
        heroText: "Our GPA forecasting tool runs simulations based on your current grades, showing precisely what scores you need to hit your target GPA.",
        icon: <BrainCircuit size={40} color="#ec4899" />,
        benefits: ["What-If Scenarios", "Cumulative GPA Tracking", "Goal Setting"]
    }
};

const FeaturePage = () => {
    const { featureId } = useParams();
    const feature = featureData[featureId] || {
        title: "Student Success Navigator Tools",
        subtitle: "AI-powered tools to optimize your college experience.",
        heroText: "Aumtech.ai provides a full suite of autonomous tools to help you study smarter, not harder.",
        icon: <Clock size={40} color="#4f46e5" />,
        benefits: ["Time Management", "Academic Planning", "Focus Tracking"]
    };

    // Update Meta Title for SEO
    useEffect(() => {
        document.title = `${feature.title} | Aumtech.ai`;
    }, [feature]);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
            {/* Minimal Header */}
            <header style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b' }}>
                    <img src={logoAsset} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>Aumtech.ai</span>
                </Link>
                <Link to="/login" style={{ background: '#4f46e5', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    Try it Free
                </Link>
            </header>

            {/* Hero Section */}
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'inline-block', padding: '1rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
                        {feature.icon}
                    </div>

                    {/* H1 Optimized for SEO */}
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                        {feature.title}
                    </h1>

                    {/* H2 Subtitle */}
                    <h2 style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '400', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
                        {feature.subtitle}
                    </h2>

                    <p style={{ fontSize: '1.125rem', color: '#475569', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.7' }}>
                        {feature.heroText}
                    </p>

                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: 'white', padding: '1rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem', transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                        Get Started <ArrowRight size={20} />
                    </Link>
                </motion.div>

                {/* Benefits / Content Section for SEO Crawlers */}
                <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                    {feature.benefits.map((benefit, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '50%', marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{benefit}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Powerful algorithms specifically tuned to handle {benefit.toLowerCase()}, allowing you to focus purely on learning rather than administrative overhead.
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FeaturePage;
