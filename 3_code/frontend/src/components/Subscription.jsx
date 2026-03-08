import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, CreditCard } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { getRevenueCatOfferings, purchaseRevenueCatPackage } from '../iap';
import api from '../api';

const Subscription = ({ userData, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState([]);
    const [debugError, setDebugError] = useState(null);

    // Platform Detection
    const [isNative, setIsNative] = useState(Capacitor.isNativePlatform());

    const loadOfferings = async () => {
        setLoading(true);
        // Unified Loading: Works for Web (Mock) and Native (Real)
        try {
            const offerings = await getRevenueCatOfferings();
            console.log("Offerings fetched:", offerings);
            if (offerings && offerings.current && offerings.current.availablePackages.length > 0) {
                setPackages(offerings.current.availablePackages);
            } else {
                console.warn("No IAP packages found.");
                if (isNative) {
                    // Detailed debug for empty offerings (Common in Sandbox)
                    // alert("DEBUG: Connected to RevenueCat, but 'current' offering is empty or has no packages. Check RevenueCat Console.");
                }
            }
        } catch (e) {
            console.error("Error fetching offerings", e);
            setDebugError(e.message);
            if (isNative) {
                alert(`IAP Fetch Error: ${e.message}\nCode: ${e.code || 'Unknown'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOfferings();
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // Unified Flow: Use iOS/Android Wrapper (Real) OR Web (Mock)
            if (packages.length > 0) {
                try {
                    const { customerInfo } = await purchaseRevenueCatPackage(packages[0]);
                    if (customerInfo.entitlements.active['premium']) {
                        alert("Success! Your subscription is active.");
                        // Ideally trigger a user profile refresh here
                    }
                } catch (e) {
                    if (!e.userCancelled) {
                        alert("Purchase failed: " + e.message);
                    }
                }
            } else {
                alert("Store is temporarily unavailable. Please try again later.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!isNative) return;
        setLoading(true);
        try {
            // Import dynamically to avoid web-build issues if package missing
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            const info = await Purchases.restorePurchases();
            if (info.customerInfo.entitlements.active['premium']) {
                alert("Purchases restored successfully!");
            } else {
                alert("No active subscriptions found to restore.");
            }
        } catch (e) {
            alert("Restore failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const subInfo = userData?.subscription_info || {};
    const isSubscribed = subInfo.status === 'active';
    const isTrial = subInfo.status === 'trialing';

    // Display Logic
    const displayPrice = (isNative && packages.length > 0)
        ? packages[0].product.priceString
        : "$9.99";

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ display: 'inline-flex', padding: '8px 16px', background: '#e0e7ff', color: '#4338ca', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' }}
                >
                    PREMIUM PLANS
                </motion.div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Elevate Your Academic Journey
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Get unlimited access to the full AI suite and stay ahead of your academic goals.
                </p>
            </div>

            {/* Trial / Status Banners */}
            {(isTrial || isSubscribed) && (
                <div style={{ background: isSubscribed ? '#f0fdf4' : '#f0f9ff', border: `1px solid ${isSubscribed ? '#bbf7d0' : '#bae6fd'}`, padding: '1.25rem', borderRadius: '16px', marginBottom: '2.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ background: isSubscribed ? '#22c55e' : '#3b82f6', color: 'white', padding: '6px', borderRadius: '50%' }}>
                        {isSubscribed ? <Check size={16} /> : <Zap size={16} />}
                    </div>
                    <span style={{ color: isSubscribed ? '#15803d' : '#0369a1', fontWeight: '700', fontSize: '1.1rem' }}>
                        {isSubscribed ? "You have an active Premium subscription." : `Free Trial Active: ${subInfo.days_left} days remaining.`}
                    </span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                {/* Basic / Free */}
                <motion.div
                    className="card-white"
                    style={{ position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Explorer</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Perfect for tracking your courses and basics.</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>Free</span>
                        </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: '#475569' }}><Check size={20} color="#10b981" /> Course Tracking</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: '#475569' }}><Check size={20} color="#10b981" /> Basic Study Tools</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: '#475569' }}><Check size={20} color="#10b981" /> Community Access</li>
                    </ul>
                </motion.div>

                {/* Premium */}
                <motion.div
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                    className="card-white"
                    style={{ border: '2px solid #4f46e5', position: 'relative', background: 'white' }}
                >
                    <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: 'white', padding: '6px 20px', borderRadius: '25px', fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}>
                        MOST POPULAR
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Success Pass</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Unlock the full power of Academic AI.</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#1e293b' }}>{displayPrice}</span>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>/ month</span>
                        </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> Unlimited Get Aura</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> Unlimited Syllabus Parsing</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: '#475569' }}><Check size={20} color="#4f46e5" /> Priority Tutoring Matching</li>
                    </ul>

                    {/* Button Rendering Logic: Only show if packages loaded OR if web */}
                    <button
                        onClick={handleSubscribe}
                        disabled={loading || isSubscribed || (isNative && packages.length === 0)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: (isNative && packages.length === 0 && !isSubscribed) ? '#94a3b8' : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            cursor: (isNative && packages.length === 0) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.2s',
                            opacity: loading || isSubscribed ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' :
                            isSubscribed ? 'Membership Active' :
                                (isNative && packages.length === 0) ? 'Store Unavailable' :
                                    'Upgrade to Premium'}
                        {!isSubscribed && <CreditCard size={20} />}
                    </button>

                    {/* Retry Link for Native if Store is Unavailable (Helps if network was flakey during review) */}
                    {isNative && packages.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            <button
                                onClick={async () => {
                                    await loadOfferings();
                                    // Diagnostic Test
                                    if (isNative) {
                                        try {
                                            const { Purchases } = await import('@revenuecat/purchases-capacitor');
                                            const products = await Purchases.getProducts({ productIdentifiers: ['Student_Success'] });
                                            alert(`DIAGNOSTIC:\nDirect Fetch found ${products.products.length} products.\nID: ${products.products[0]?.identifier || 'None'}`);
                                        } catch (e) {
                                            alert(`DIAGNOSTIC FAILED: ${e.message}`);
                                        }
                                    }
                                }}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Retry loading products
                            </button>
                        </div>
                    )}

                    {/* Native Restore Button (Required by Apple) */}
                    {isNative && !isSubscribed && (
                        <button
                            onClick={handleRestore}
                            disabled={loading}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Restore Purchases
                        </button>
                    )}

                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>Cancel anytime. {isNative ? 'Managed via Apple ID.' : 'No hidden fees.'}</p>
                </motion.div>
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <span style={{ borderBottom: '1px solid #cbd5e1' }}>Continue with limited access</span>
                </button>
            </div>
        </div >
    );
};


export default Subscription;
