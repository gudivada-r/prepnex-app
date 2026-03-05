import React from 'react';
import logoAsset from '../assets/logo.png';

const Footer = ({ onNavigate }) => {
    return (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto', textAlign: 'center' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logoAsset} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>Student Success Navigator</span>
                </div>

                {/* Centralized Links */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <a href="#" style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} className="footer-link">About</a>
                    <a href="#" style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} className="footer-link">Team</a>
                    <a href="#" style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} className="footer-link">Careers</a>
                    <a href="#" style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} className="footer-link">Blog</a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('privacy'); }}
                        style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }}
                        className="footer-link"
                    >
                        Privacy
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('msa'); }}
                        style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }}
                        className="footer-link"
                    >
                        MSA
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('sla'); }}
                        style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }}
                        className="footer-link"
                    >
                        SLA
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('support'); }}
                        style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }}
                        className="footer-link"
                    >
                        Support
                    </a>
                </div>

                {/* Copyright */}
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    © 2026 Student Success Navigator | www.aumtech.ai. All rights reserved.
                </div>
            </div>
            <style>{`
                .footer-link:hover { color: #0f172a !important; text-decoration: underline !important; }
            `}</style>
        </div>
    );
};

export default Footer;
