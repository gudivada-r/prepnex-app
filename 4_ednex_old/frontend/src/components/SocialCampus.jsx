import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, ShoppingBag, Plus, BookOpen, MapPin, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const SocialCampus = () => {
    const [activeTab, setActiveTab] = useState('study'); // study, mentors, marketplace
    const [loading, setLoading] = useState(false);

    // Data State
    const [studyGroups, setStudyGroups] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [marketItems, setMarketItems] = useState([]);

    // Modals
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showBecomeMentor, setShowBecomeMentor] = useState(false);
    const [showSellItem, setShowSellItem] = useState(false);

    // Form Data
    const [newGroup, setNewGroup] = useState({ name: '', course_code: '', topic: '', schedule: '', location: '' });
    const [newMentor, setNewMentor] = useState({ specialty: '', bio: '', availability: '' });
    const [newItem, setNewItem] = useState({ title: '', price: '', condition: 'Good', image_url: '' });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'study') {
                const res = await api.get('/api/social/study-groups');
                setStudyGroups(res.data);
            } else if (activeTab === 'mentors') {
                const res = await api.get('/api/social/mentors');
                setMentors(res.data);
            } else if (activeTab === 'marketplace') {
                const res = await api.get('/api/social/marketplace');
                setMarketItems(res.data);
            }
        } catch (error) {
            console.error("Failed to load social data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        await api.post('/api/social/study-groups', newGroup);
        setShowCreateGroup(false);
        loadData();
    };

    const handleJoinGroup = async (id) => {
        await api.post(`/api/social/study-groups/${id}/join`);
        loadData(); // Re-fetch to update count
        alert("You have joined the study group!");
    };

    const handleBecomeMentor = async (e) => {
        e.preventDefault();
        await api.post('/api/social/mentors', newMentor);
        setShowBecomeMentor(false);
        loadData();
    };

    const handleBookMentor = async (id) => {
        await api.post(`/api/social/mentors/${id}/book`);
        alert("Session booked! Check your email.");
    };

    const handleSellItem = async (e) => {
        e.preventDefault();
        await api.post('/api/social/marketplace', { ...newItem, price: parseFloat(newItem.price) });
        setShowSellItem(false);
        loadData();
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Social Campus</h1>
                <p style={{ color: '#64748b' }}>Connect, learn, and trade with your university community.</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                <TabButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={Users} label="Study Groups" />
                <TabButton active={activeTab === 'mentors'} onClick={() => setActiveTab('mentors')} icon={GraduationCap} label="Peer Mentoring" />
                <TabButton active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} icon={ShoppingBag} label="Textbook Marketplace" />
            </div>

            {/* Content Area */}
            {loading ? <p>Loading community data...</p> : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                    {/* STUDY GROUPS TAB */}
                    {activeTab === 'study' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative', width: '300px' }}>
                                    <Search style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} size={20} />
                                    <input placeholder="Search courses..." style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <button onClick={() => setShowCreateGroup(true)} className="primary-btn">
                                    <Plus size={18} /> Create Group
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {studyGroups.map(group => (
                                    <div key={group.id} className="card-white" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{group.name}</h3>
                                            <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                                                {group.course_code}
                                            </span>
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{group.topic}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            <Calendar size={16} /> {group.schedule}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                            <MapPin size={16} /> {group.location}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {group.members_count} / {group.max_members} Members
                                            </span>
                                            <button
                                                onClick={() => handleJoinGroup(group.id)}
                                                disabled={group.members_count >= group.max_members}
                                                style={{ padding: '0.5rem 1rem', background: group.members_count >= group.max_members ? '#cbd5e1' : '#4f46e5', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                            >
                                                {group.members_count >= group.max_members ? 'Full' : 'Join'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MENTORS TAB */}
                    {activeTab === 'mentors' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button onClick={() => setShowBecomeMentor(true)} className="primary-btn">
                                    Become a Mentor
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {mentors.map(mentor => (
                                    <div key={mentor.id} className="card-white" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b' }}>
                                            {mentor.mentor_name.charAt(0)}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{mentor.mentor_name}</h3>
                                        <p style={{ color: '#4f46e5', fontSize: '0.9rem', fontWeight: '600' }}>{mentor.specialty}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '1rem 0' }}>"{mentor.bio}"</p>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Available: {mentor.availability}</p>
                                        <button onClick={() => handleBookMentor(mentor.id)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #4f46e5', background: 'white', color: '#4f46e5', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                                            Request Session
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MARKETPLACE TAB */}
                    {activeTab === 'marketplace' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button onClick={() => setShowSellItem(true)} className="primary-btn">
                                    <Plus size={18} /> Sell a Book
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {marketItems.map(item => (
                                    <div key={item.id} className="card-white" style={{ overflow: 'hidden' }}>
                                        <div style={{ height: '150px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                            {item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={48} />}
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <h4 style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.title}</h4>
                                                <span style={{ fontWeight: 'bold', color: '#10b981' }}>${item.price}</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Sold by {item.seller_name}</p>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{item.condition}</span>
                                                <button style={{ fontSize: '0.85rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Contact</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Modals */}
            {showCreateGroup && (
                <Modal onClose={() => setShowCreateGroup(false)} title="Create Study Group">
                    <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input placeholder="Group Name" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} required className="input-field" />
                        <input placeholder="Course Code (e.g. CS101)" value={newGroup.course_code} onChange={e => setNewGroup({ ...newGroup, course_code: e.target.value })} required className="input-field" />
                        <input placeholder="Topic" value={newGroup.topic} onChange={e => setNewGroup({ ...newGroup, topic: e.target.value })} required className="input-field" />
                        <input placeholder="Schedule (e.g. Mon 5pm)" value={newGroup.schedule} onChange={e => setNewGroup({ ...newGroup, schedule: e.target.value })} required className="input-field" />
                        <input placeholder="Location" value={newGroup.location} onChange={e => setNewGroup({ ...newGroup, location: e.target.value })} required className="input-field" />
                        <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>Create Group</button>
                    </form>
                </Modal>
            )}

            {showBecomeMentor && (
                <Modal onClose={() => setShowBecomeMentor(false)} title="Register as Mentor">
                    <form onSubmit={handleBecomeMentor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input placeholder="Specialty (e.g. Chemistry)" value={newMentor.specialty} onChange={e => setNewMentor({ ...newMentor, specialty: e.target.value })} required className="input-field" />
                        <textarea placeholder="Short Bio" value={newMentor.bio} onChange={e => setNewMentor({ ...newMentor, bio: e.target.value })} required className="input-field" style={{ minHeight: '80px' }} />
                        <input placeholder="Availability (e.g. Weekends)" value={newMentor.availability} onChange={e => setNewMentor({ ...newMentor, availability: e.target.value })} required className="input-field" />
                        <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>Sign Up</button>
                    </form>
                </Modal>
            )}

            {showSellItem && (
                <Modal onClose={() => setShowSellItem(false)} title="Sell Textbook">
                    <form onSubmit={handleSellItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input placeholder="Book Title" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} required className="input-field" />
                        <input type="number" placeholder="Price ($)" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required className="input-field" />
                        <select value={newItem.condition} onChange={e => setNewItem({ ...newItem, condition: e.target.value })} className="input-field">
                            <option value="New">New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                        </select>
                        <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>List Item</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '1rem', background: 'none', border: 'none',
            borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent',
            color: active ? '#4f46e5' : '#64748b', fontWeight: active ? 'bold' : '500',
            cursor: 'pointer', fontSize: '1rem'
        }}
    >
        <Icon size={20} />
        {label}
    </button>
);

const Modal = ({ onClose, title, children }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
            {children}
        </div>
    </div>
);

export default SocialCampus;
