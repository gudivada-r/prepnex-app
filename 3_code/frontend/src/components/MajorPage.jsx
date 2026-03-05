import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Compass, Target, BookOpen } from 'lucide-react';
import logoAsset from '../assets/logo.png';

const majorData = {
    'computer-science': {
        name: "Computer Science",
        pain: "Between LeetCode, Operating Systems, and intense projects, CS majors face high burnout.",
        solution: "Aumtech.ai automatically schedules your coding blocks, tracks GitHub repos, and pre-loads your CS syllabus."
    },
    'nursing': {
        name: "Nursing",
        pain: "Clinical rotations, intense exams, and strict prerequisites make nursing one of the toughest tracks.",
        solution: "Use Aumtech.ai to manage clinical hours, prioritize high-stakes ATI exams, and track wellness."
    },
    'business': {
        name: "Business Administration",
        pain: "Networking events, group projects, and core finance classes require immense time management.",
        solution: "Our Student Navigator links with your calendar to balance networking events and study sessions effortlessly."
    },
    'pre-med': {
        name: "Pre-Med (Biology/Chemistry)",
        pain: "Protecting your GPA for medical school while managing labs and the MCAT is incredibly stressful.",
        solution: "Aumtech.ai's GPA forecaster and Flashcard generator are specifically designed to handle massive amounts of dense scientific data."
    }
};

const MajorPage = () => {
    const { majorId } = useParams();
    const major = majorData[majorId] || {
        name: majorId.replace("-", " "),
        pain: "Balancing the demands of your specific major requires advanced time management and support.",
        solution: "Aumtech.ai adapts to your curriculum, extracting your syllabus and creating a personalized study plan."
    };

    // Update Meta Title for SEO
    useEffect(() => {
        document.title = `AI Student Success Platform for ${major.name} Majors | Aumtech.ai`;
    }, [major]);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
            {/* Header */}
            <header style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b' }}>
                    <img src={logoAsset} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>Aumtech.ai</span>
                </Link>
                <Link to="/login" style={{ background: '#4f46e5', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    Sign Up Free
                </Link>
            </header>

            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', padding: '1rem', background: '#e0e7ff', borderRadius: '50%', marginBottom: '2rem' }}>
                        <GraduationCap size={48} color="#4f46e5" />
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
                        The Ultimate Student Tool for <span style={{ color: '#4f46e5', textTransform: 'capitalize' }}>{major.name}</span> Majors
                    </h1>

                    <h2 style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '400', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        {major.pain} {major.solution}
                    </h2>

                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#4f46e5', color: 'white', padding: '1.25rem 2.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1.25rem', boxShadow: '0 20px 25px -5px rgb(79 70 229 / 0.3)' }}>
                        Start Your Free Trial <ArrowRight size={24} />
                    </Link>
                </motion.div>

                {/* SEO Content Grids */}
                <div style={{ marginTop: '6rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1.5rem', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '12px' }}>
                            <Target size={32} color="#d97706" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Defend Your GPA</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                As a {major.name} major, every point counts. Our predictive GPA tools simulate your semester trajectory so there are no surprises during finals week.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: '1.5rem', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ padding: '1rem', background: '#dcefa5', borderRadius: '12px' }}>
                            <Compass size={32} color="#4d7c0f" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Automated Career Tracking</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                Aumtech.ai connects your coursework directly to job market prerequisites, ensuring your electives align with industry demands.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MajorPage;
