import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const specialties = [
    {
        id: 'cardiology',
        name: 'Cardiology',
        description: 'Comprehensive care for heart-related conditions including hypertension, heart failure, and arrhythmia.',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800',
        features: ['ECG Interpretation', 'Blood Pressure Management', 'Cholesterol Screening', 'Heart Health Education']
    },
    {
        id: 'angioplasty',
        name: 'Angioplasty & Vascular',
        description: 'Advanced minimally invasive procedures to restore blood flow through narrowed or blocked arteries.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
        features: ['Stent Consultation', 'Arterial Assessment', 'Post-Op Monitoring', 'Vascular Health']
    },
    {
        id: 'dental',
        name: 'Dental Care',
        description: 'Professional oral health services from routine cleaning to advanced restorative procedures.',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800',
        features: ['Virtual Consultations', 'Orthodontic Assessment', 'Oral Hygiene Plans', 'Dental Emergency Advice']
    },
    {
        id: 'endocrinology',
        name: 'Endocrinology',
        description: 'Expert management of hormone-related disorders, with a specialty in diabetes care and thyroid health.',
        image: 'https://images.unsplash.com/photo-1505751172107-57322a30239b?auto=format&fit=crop&q=80&w=800',
        features: ['Diabetes Management', 'Thyroid Assessment', 'Hormone Level Analysis', 'Nutritional Counseling']
    },
    {
        id: 'pediatrics',
        name: 'Pediatrics',
        description: 'Compassionate medical care for infants, children, and adolescents, ensuring their healthy growth.',
        image: 'https://images.unsplash.com/photo-1584362946521-4e19510e24e0?auto=format&fit=crop&q=80&w=800',
        features: ['Growth Monitoring', 'Immunization Guidance', 'Nutrition Support', 'Childhood Illness Care']
    },
    {
        id: 'dermatology',
        name: 'Dermatology',
        description: 'Specialized care for skin, hair, and nail conditions using advanced diagnostic and treatment tools.',
        image: 'https://images.unsplash.com/photo-1584362946521-4e19510e24e0?auto=format&fit=crop&q=80&w=800',
        features: ['Skin Cancer Screening', 'Acne Treatment', 'Eczema Management', 'Cosmetic Consultation']
    }
];

export default function Specialties({ user }: { user?: any }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Find the current specialty if an ID is provided, else show the listing
    const currentSpecialty = specialties.find(s => s.id === id);

    if (currentSpecialty) {
        return (
            <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
                <PublicNavbar user={user} />
                
                <section style={{ background: '#0f172a', color: 'white', padding: '100px 0' }}>
                    <div className="container grid-2" style={{ alignItems: 'center', gap: '60px' }}>
                        <div>
                            <button onClick={() => navigate('/specialties')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', marginBottom: '30px', cursor: 'pointer' }}>← All Specialties</button>
                            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>{currentSpecialty.name}</h1>
                            <p style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.6' }}>{currentSpecialty.description}</p>
                        </div>
                        <div>
                            <img src={currentSpecialty.image} alt={currentSpecialty.name} style={{ width: '100%', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                        </div>
                    </div>
                </section>

                <section className="section-padding">
                    <div className="container">
                        <div className="grid-2" style={{ gap: '40px' }}>
                            <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <h2 style={{ marginBottom: '30px' }}>Our Expertise</h2>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {currentSpecialty.features.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center', color: '#475569' }}>
                                            <div style={{ width: '10px', height: '10px', background: '#2E37A4', borderRadius: '50%' }}></div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#2E37A4', padding: '40px', borderRadius: '32px', color: 'white' }}>
                                <h2>Book a Specialist</h2>
                                <p style={{ opacity: 0.9, margin: '20px 0 30px' }}>Get immediate access to verified experts in {currentSpecialty.name}. Skip the wait and start your consultation today.</p>
                                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ background: 'white', color: '#2E37A4', padding: '15px 30px', borderRadius: '12px' }}>Consult Now</button>
                            </div>
                        </div>
                    </div>
                </section>

                <PublicFooter />
            </div>
        );
    }

    return (
        <div style={{ background: 'white' }}>
            <PublicNavbar user={user} />
            
            <section style={{ background: '#f8fafc', padding: '80px 0' }}>
                <div className="container text-center">
                    <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a' }}>Medical Specialties</h1>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '20px auto' }}>We offer expert care across a wide range of medical disciplines, ensuring holistic health management for all our patients.</p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="grid-3" style={{ gap: '30px' }}>
                        {specialties.map(s => (
                            <div key={s.id} onClick={() => navigate(`/specialties/${s.id}`)} style={{ 
                                background: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', 
                                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' 
                            }} className="specialty-card">
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '25px' }}>
                                    <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '10px' }}>{s.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{s.description.slice(0, 80)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
            <style>{`
                .specialty-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #2E37A4; }
            `}</style>
        </div>
    );
}
