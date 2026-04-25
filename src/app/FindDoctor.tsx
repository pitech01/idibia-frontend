import { useState, useEffect } from 'react';
import { api } from '../services';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    MapPin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Star: () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    Filter: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18m-18 6h18m-18 6h18" /></svg>,
    Clock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ArrowRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M3 12h18" /></svg>
};

export default function FindDoctor({ user }: { user?: any }) {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctors');
                setDoctors(response.data);
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const specialties = ['All Specialties', ...new Set(doctors.map(d => d.doctor?.specialty || 'General Practitioner'))];

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All Specialties' || (doc.doctor?.specialty === selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="find-doctor-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PublicNavbar user={user} />
            {/* Header */}
            <div style={{ background: 'var(--primary-gradient)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Find the Best Doctors Near You</h1>
                    <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
                        Browse through our verified specialists and book a consultation in minutes.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="search-bar-wrapper" style={{ 
                        maxWidth: '800px', margin: '0 auto', background: 'white', padding: '10px', 
                        borderRadius: '16px', display: 'flex', gap: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: 2, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '15px', color: '#94a3b8' }}><Icons.Search /></span>
                            <input 
                                type="text" 
                                placeholder="Search by doctor name or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '15px 15px 15px 45px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', color: '#1e293b' }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <select 
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                style={{ width: '100%', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', color: '#1e293b', background: '#f8fafc' }}
                            >
                                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '0 40px' }}>Search</button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '60px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                        {loading ? 'Finding Doctors...' : `${filteredDoctors.length} Doctors Available`}
                    </h2>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={{ height: '400px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', animation: 'pulse 2s infinite' }}></div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {filteredDoctors.map(doc => (
                            <div key={doc.id} className="doctor-card-alt" style={{ 
                                background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden',
                                transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ height: '200px', background: '#e0f2fe', position: 'relative' }}>
                                    <img 
                                        src={doc.avatar || `https://ui-avatars.com/api/?name=${doc.name}&background=random&size=200`} 
                                        alt={doc.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Icons.Star /> 4.9
                                    </div>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ color: '#0284c7', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                                        {doc.doctor?.specialty || 'General Practitioner'}
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{doc.name}</h3>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#64748b', fontSize: '13px' }}>
                                        <span className="flex-start"><Icons.MapPin /> Lagos, NGA</span>
                                        <span className="flex-start"><Icons.Clock /> 9am - 5pm</span>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Consultation Fee</span>
                                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>₦{parseFloat(doc.doctor?.consultation_fee || 5000).toLocaleString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="btn btn-primary" 
                                            style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px' }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredDoctors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>No doctors found</h3>
                        <p style={{ color: '#64748b' }}>Try adjusting your search or specialty filter.</p>
                    </div>
                )}
            </div>
            <PublicFooter />
        </div>
    );
}
