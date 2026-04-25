import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services';
import heroImg from '../assets/hero-doctor.png';
import aboutImg from '../assets/about-team.png';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

// Icons as components
const Icons = {
    Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Facebook: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>,
    Twitter: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>,
    Play: () => <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
    Heart: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Check: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Plus: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    ArrowUpRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" /></svg>,
    MapPin: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface HomepageProps {
    onLoginClick?: () => void;
    onDashboardClick?: () => void;
    user?: any;
}

export default function Homepage({ onLoginClick, onDashboardClick, user }: HomepageProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch blog posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="homepage-wrapper">
            <PublicNavbar user={user} onLoginClick={onLoginClick} onDashboardClick={onDashboardClick} />

            {/* 3. Hero Section */}
            <header className="hero">
                <div className="container grid-2" style={{ alignItems: 'center' }}>
                    <div className="hero-content">
                        <span style={{ color: 'var(--primary-color)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>
                            Healthcare Reimagined
                        </span>
                        <h1>Empowering <br /> Health Through <span className="text-primary">Communication</span></h1>
                        <p>
                            Bridging the gap between patients and providers in Nigeria. Consult in English, Pidgin, Yoruba, Igbo, or Hausa.
                        </p>
                        <div className="flex-start" style={{ gap: '20px' }}>
                            <button className="btn btn-primary" onClick={() => window.location.href = '/find-doctor'}>Search for Doctors</button>
                            <div className="flex-start" style={{ fontWeight: '600', cursor: 'pointer' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <Icons.Play />
                                </div>
                                <span>How It Works</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image-wrapper">
                        <div className="hero-circle-bg"></div>
                        <div className="hero-bg-image" style={{ backgroundImage: `url(${heroImg})`, backgroundPosition: 'top center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'relative', borderRadius: '20px' }}>
                            <div className="exp-badge">
                                <div style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1, color: 'var(--primary-color)' }}>12+</div>
                                <div style={{ fontSize: '13px', lineHeight: 1.2, color: '#666' }}>Specialist <br />Categories</div>
                            </div>

                            <div style={{ position: 'absolute', top: '60px', right: '-20px', background: 'white', padding: '15px', borderRadius: '15px', boxShadow: 'var(--shadow)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}><Icons.Heart /></div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>100%</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>Satisfaction</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 4. About & Features */}
            <section className="about-area">
                <div className="container grid-2" style={{ alignItems: 'center' }}>
                    <div className="relative">
                        <div className="about-bg-image" style={{ backgroundImage: `url(${aboutImg})`, backgroundPosition: 'center', backgroundSize: 'cover', borderRadius: '20px 20px 100px 20px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', background: 'white', padding: '20px', borderRadius: '20px', boxShadow: 'var(--shadow)' }}>
                            <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--secondary-color)' }}>MDCN</div>
                            <div style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Verified Doctors</div>
                        </div>
                    </div>

                    <div>
                        <span className="text-primary" style={{ fontWeight: '700', textTransform: 'uppercase' }}>Built for Nigeria</span>
                        <h2 style={{ fontSize: '42px', margin: '15px 0 30px', color: 'var(--secondary-color)' }}>Experience Healthcare <br /> Designed for You</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>
                            We support your health at every stage with localized features like low-data mode for 3G networks and voice assistance for the elderly.
                        </p>

                        <div className="grid-2" style={{ gap: '20px', marginBottom: '40px' }}>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li className="flex-start"><span style={{ color: 'var(--primary-color)' }}><Icons.Check /></span> <span>Multi-Language Support</span></li>
                                <li className="flex-start"><span style={{ color: 'var(--primary-color)' }}><Icons.Check /></span> <span>Secure Only (IDIBIA TRUST)</span></li>
                            </ul>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li className="flex-start"><span style={{ color: 'var(--primary-color)' }}><Icons.Check /></span> <span>Works on 3G Networks</span></li>
                                <li className="flex-start"><span style={{ color: 'var(--primary-color)' }}><Icons.Check /></span> <span>24/7 Virtual Support</span></li>
                            </ul>
                        </div>

                        <button className="btn btn-primary">Our Guarantee</button>
                    </div>
                </div>
            </section>

            {/* 5. Stats Strip */}
            <div className="stats-strip">
                <div className="container grid-4 text-center">
                    <div>
                        <h2 className="stat-number">15+</h2>
                        <div style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.8 }}>Cardiologists</div>
                    </div>
                    <div>
                        <h2 className="stat-number">10+</h2>
                        <div style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.8 }}>Neurologists</div>
                    </div>
                    <div>
                        <h2 className="stat-number">12+</h2>
                        <div style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.8 }}>Orthopedics</div>
                    </div>
                    <div>
                        <h2 className="stat-number">5 Languages</h2>
                        <div style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.8 }}>Supported</div>
                    </div>
                </div>
            </div>

            {/* 6. Medical Services Grid */}
            <section className="section-padding" style={{ background: '#f8fafc' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '60px' }}>
                        <span className="text-primary" style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Specialties</span>
                        <h2 style={{ fontSize: '42px', color: 'var(--secondary-color)', marginTop: '10px' }}>Specialized Care <br /> For Every Need</h2>
                    </div>

                    <div className="grid-4">
                        {/* Service Items ... */}
                        <div className="service-card">
                            <div className="service-icon"><Icons.Plus /></div>
                            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>General Medicine</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Primary care for malaria, typhoid, and daily health concerns.</p>
                            <Link to="/find-doctor" className="flex-start text-primary" style={{ fontWeight: '600', fontSize: '14px' }}>Book Now <Icons.Plus /></Link>
                        </div>

                        <div className="service-card" style={{ borderBottom: '3px solid var(--primary-color)' }}>
                            <div className="service-icon" style={{ background: 'var(--primary-gradient)', color: 'white' }}><Icons.Heart /></div>
                            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Cardiology</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Expert heart care specialists available for consultation.</p>
                            <Link to="/find-doctor" className="flex-start text-primary" style={{ fontWeight: '600', fontSize: '14px' }}>Book Now <Icons.Plus /></Link>
                        </div>

                        <div className="service-card">
                            <div className="service-icon"><Icons.Check /></div>
                            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Pediatrics</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Dedicated child healthcare specialists.</p>
                            <Link to="/find-doctor" className="flex-start text-primary" style={{ fontWeight: '600', fontSize: '14px' }}>Book Now <Icons.Plus /></Link>
                        </div>

                        <div className="service-card">
                            <div className="service-icon"><Icons.Mail /></div>
                            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Neurology</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Specialized brain and nervous system care.</p>
                            <a href="#" className="flex-start text-primary" style={{ fontWeight: '600', fontSize: '14px' }}>Book Now <Icons.Plus /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. NEW: Blog Section (Matching Screenshot) */}
            {/* 7. NEW: Blog Section (Matching Screenshot) */}
            <section className="section-padding">
                <div className="container">
                    <div className="flex-between" style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '36px', color: 'var(--secondary-color)' }}>Stay Informed With Our Latest <br /> Health Blogs</h2>
                        <button className="btn btn-primary" style={{ padding: '10px 25px' }} onClick={() => navigate('/blog')}>View All <Icons.ArrowUpRight /></button>
                    </div>

                    <div className="blog-grid">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="blog-card" style={{ background: '#f1f5f9', animation: 'pulse 2s infinite', height: '545px' }}></div>
                            ))
                        ) : posts.length > 0 ? (
                            <>
                                {posts.slice(0, 4).map((post, idx) => (
                                    <div key={post.id} className={`blog-card blog-card-${idx + 1}`} style={{ 
                                        backgroundImage: post.image_url ? `url(${post.image_url})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                        <div className="blog-overlay-gradient"></div>
                                        <div className="blog-content-layer">
                                            <div className="blog-date-pill">{post.time_to_read || '5 min read'}</div>
                                            <h3 className={idx < 2 ? "blog-title-lg" : "blog-title-sm"}>
                                                {post.title}
                                            </h3>
                                            <div className="btn-circle-white" onClick={() => navigate(`/blog/${post.id}`)}><Icons.ArrowUpRight /></div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* 8. NEW: Map Section (Google Maps Iframe) */}
            <section className="map-section">
                {/* Real Embedded Map of Lagos (Demo Location) */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.527638695278475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e09d0d34805!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1645564756245!5m2!1sen!2sus"
                    className="map-frame"
                    allowFullScreen={true}
                    loading="lazy"
                ></iframe>

                {/* Overlay Card */}
                <div className="map-card">
                    <h3>Get In Touch With Us</h3>
                    <p>Reach out to us for expert support and personalized care.</p>

                    <div className="map-card-item">
                        <div className="map-icon"><Icons.MapPin /></div>
                        <div>
                            <h4>Address</h4>
                            <p style={{ margin: 0, opacity: 0.8 }}>234 Oak Drive, Villagetown, NGA</p>
                        </div>
                    </div>

                    <div className="map-card-item">
                        <div className="map-icon"><Icons.Phone /></div>
                        <div>
                            <h4>Contact Us</h4>
                            <p style={{ margin: 0, opacity: 0.8 }}>+234 800 DIBIA MED</p>
                        </div>
                    </div>

                    <div className="map-card-item">
                        <div className="map-icon"><Icons.Mail /></div>
                        <div>
                            <h4>Send us a Mail</h4>
                            <p style={{ margin: 0, opacity: 0.8 }}>sales@dibia.med</p>
                        </div>
                    </div>

                    <div className="map-card-item">
                        <div className="map-icon"><Icons.Clock /></div>
                        <div>
                            <h4>Opening Time</h4>
                            <p style={{ margin: 0, opacity: 0.8 }}>Mon - Fri: 8:00am - 5:00pm</p>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Book Appointment <Icons.ArrowUpRight /></button>
                </div>
            </section>


            {/* 9. Contact Strip (Above Footer) */}
            <div className="contact-strip">
                <div className="container flex-between" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '24px', color: 'var(--secondary-color)', marginBottom: '10px' }}>Get in Touch with us</h3>
                        <p style={{ color: '#64748b' }}>Reach out to us for expert support.</p>
                    </div>

                    <div className="flex-start" style={{ gap: '30px' }}>
                        <div className="contact-strip-item">
                            <div className="contact-strip-icon"><Icons.Phone /></div>
                            <div className="contact-strip-text">
                                <h4>Contact Us</h4>
                                <p>123 456 7890</p>
                            </div>
                        </div>

                        <div className="contact-strip-item">
                            <div className="contact-strip-icon"><Icons.Mail /></div>
                            <div className="contact-strip-text">
                                <h4>Send us a Mail</h4>
                                <p>sales@dibia.med</p>
                            </div>
                        </div>

                        <div className="contact-strip-item">
                            <div className="contact-strip-icon"><Icons.Clock /></div>
                            <div className="contact-strip-text">
                                <h4>Opening Time</h4>
                                <p>Mon-Fri: 8am-5pm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />

        </div>
    );
}
