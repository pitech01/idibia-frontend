import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    Video: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Chat: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Prescription: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Laboratory: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.242c0 .289.248.524.53.524h3.44c.282 0 .53-.235.53-.524V3.104m-4.5 0h4.5m-4.5 0H9.75M9.75 3.104a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75m-6.75 0v1.242c0 .289.248.524.53.524h3.44c.282 0 .53-.235.53-.524V3.104m-4.5 0h4.5m-4.5 0H9.75" /></svg>,
    ArrowRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
};

export default function Services({ user }: { user?: any }) {
    const navigate = useNavigate();

    const services = [
        {
            title: 'Video Consultations',
            description: 'Connect with expert doctors from the comfort of your home via high-definition video calls.',
            icon: <Icons.Video />,
            color: '#2563eb',
            bg: '#eff6ff'
        },
        {
            title: 'Instant Messaging',
            description: 'Chat with healthcare professionals for quick advice, follow-ups, and non-emergency concerns.',
            icon: <Icons.Chat />,
            color: '#0891b2',
            bg: '#ecfeff'
        },
        {
            title: 'Digital Prescriptions',
            description: 'Receive and manage your medical prescriptions digitally, directly through your patient portal.',
            icon: <Icons.Prescription />,
            color: '#059669',
            bg: '#ecfdf5'
        },
        {
            title: 'Lab Test Bookings',
            description: 'Book laboratory tests and receive your results securely within the IDIBIA platform.',
            icon: <Icons.Laboratory />,
            color: '#7c3aed',
            bg: '#f5f3ff'
        }
    ];

    return (
        <div className="services-page" style={{ minHeight: '100vh', background: 'white' }}>
            <PublicNavbar user={user} />
            {/* Hero Section */}
            <div style={{ background: '#0f172a', color: 'white', padding: '60px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '20px' }}>What We Offer</span>
                    <h1 className="services-hero-title" style={{ fontSize: '56px', fontWeight: '900', marginBottom: '30px', lineHeight: '1.1' }}>Comprehensive Digital <br /> Health Services</h1>
                    <p style={{ fontSize: '18px', opacity: 0.7, maxWidth: '700px', lineHeight: '1.6' }}>
                        IDIBIA is more than just a video calling app. We provide a full ecosystem for your medical needs, designed specifically for the Nigerian environment.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container" style={{ padding: '60px 0' }}>
                <div className="grid-services" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    {services.map((service, idx) => (
                        <div key={idx} style={{ 
                            padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', background: 'white',
                            transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                        }} className="service-hover-card">
                            <div style={{ 
                                width: '80px', height: '80px', background: service.bg, color: service.color,
                                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '30px'
                            }}>
                                {service.icon}
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>{service.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '30px', flex: 1 }}>{service.description}</p>
                            <button 
                                onClick={() => navigate('/login')}
                                style={{ 
                                    background: 'none', border: 'none', color: service.color, fontWeight: '700',
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: 0
                                }}
                            >
                                Get Started <Icons.ArrowRight />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Localized Care Section */}
            <div style={{ background: '#f8fafc', padding: '60px 0' }}>
                <div className="container">
                    <div className="localized-care-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Designed for Nigeria</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ minWidth: '24px', height: '24px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Multi-Language Support</h4>
                                        <p style={{ color: '#64748b', fontSize: '15px' }}>Consult with doctors who speak your native language: English, Pidgin, Yoruba, Igbo, or Hausa.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ minWidth: '24px', height: '24px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Low Data Usage</h4>
                                        <p style={{ color: '#64748b', fontSize: '15px' }}>Optimized for 3G networks and areas with limited connectivity, ensuring healthcare is always reachable.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ minWidth: '24px', height: '24px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Emergency Redirect</h4>
                                        <p style={{ color: '#64748b', fontSize: '15px' }}>Instant access to emergency services and nearest verified hospitals if virtual care is not enough.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ background: 'var(--primary-gradient)', borderRadius: '40px', height: '500px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                    <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>IDIBIA Trust Guarantee</h4>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Every doctor on our platform is MDCN-verified with a minimum of 5 years experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
