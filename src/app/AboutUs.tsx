import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    Check: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Users: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Award: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

export default function AboutUs({ user }: { user?: any }) {
    return (
        <div className="about-page" style={{ background: 'white' }}>
            <PublicNavbar user={user} />

            {/* Hero Section */}
            <section style={{ 
                background: 'linear-gradient(rgba(46, 55, 164, 0.9), rgba(46, 55, 164, 0.9)), url("https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=2000")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '120px 0 100px',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '24px' }}>About IDIBIA Med</h1>
                    <p style={{ fontSize: '20px', maxWidth: '800px', margin: '0 auto', opacity: 0.9, lineHeight: '1.6' }}>
                        Revolutionizing healthcare in Nigeria through technology, compassion, and accessible medical services for everyone.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="section-padding">
                <div className="container">
                    <div className="grid-2" style={{ alignItems: 'center', gap: '80px' }}>
                        <div>
                            <span style={{ color: '#2E37A4', fontWeight: '700', textTransform: 'uppercase', tracking: '2px', fontSize: '14px', display: 'block', marginBottom: '15px' }}>Our Journey</span>
                            <h2 style={{ fontSize: '42px', color: '#0f172a', marginBottom: '30px', lineHeight: '1.2' }}>Bridging the Gap Between Patients and Doctors</h2>
                            <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.8', marginBottom: '20px' }}>
                                Founded in 2024, IDIBIA Med was born out of a simple necessity: making quality healthcare accessible to every Nigerian, regardless of their location or status. 
                            </p>
                            <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.8' }}>
                                We realized that the traditional healthcare model often failed those in remote areas or those with busy schedules. By leveraging mobile technology and a network of dedicated medical professionals, we've created a platform that brings the clinic to your doorstep.
                            </p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                                alt="Medical Team" 
                                style={{ width: '100%', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                            />
                            <div style={{ 
                                position: 'absolute', bottom: '-30px', left: '-30px', 
                                background: 'white', padding: '30px', borderRadius: '24px', 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: '250px' 
                            }}>
                                <h4 style={{ color: '#2E37A4', fontSize: '32px', fontWeight: '900', margin: '0' }}>10k+</h4>
                                <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Lives impacted across Nigeria</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section style={{ background: '#f8fafc', padding: '100px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '36px', color: '#0f172a' }}>Our Core Values</h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '15px auto' }}>These principles guide every decision we make and every patient we treat.</p>
                    </div>
                    <div className="grid-3">
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E37A4', marginBottom: '25px' }}>
                                <Icons.Shield />
                            </div>
                            <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Trust & Integrity</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>We maintain the highest standards of medical ethics and patient confidentiality in all our interactions.</p>
                        </div>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#fff7ed', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', marginBottom: '25px' }}>
                                <Icons.Users />
                            </div>
                            <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Patient-First</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Every feature of our platform is designed with the patient's comfort and health as the top priority.</p>
                        </div>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#ecfdf5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '25px' }}>
                                <Icons.Award />
                            </div>
                            <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Excellence</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>We continuously innovate to provide the most advanced and efficient healthcare solutions available.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '36px', color: '#0f172a' }}>Why Choose IDIBIA Med?</h2>
                    </div>
                    <div className="grid-2" style={{ gap: '40px' }}>
                        {[
                            "24/7 Access to certified medical professionals",
                            "Seamless digital health record management",
                            "Secure and transparent payment systems",
                            "Localized care including Pidgin English support",
                            "Mobile diagnostic services brought to you",
                            "Strict data privacy and security protocols"
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                                <div style={{ color: '#059669' }}><Icons.Check /></div>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
