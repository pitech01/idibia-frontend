import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Icons = {
    Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Facebook: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>,
    Twitter: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>,
    Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface PublicNavbarProps {
    user?: any;
    onLoginClick?: () => void;
    onDashboardClick?: () => void;
}

export default function PublicNavbar({ user, onLoginClick, onDashboardClick }: PublicNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleDashboardClick = () => {
        if (onDashboardClick) {
            onDashboardClick();
        } else {
            // Fallback logic
            const userRole = user?.role;
            if (userRole === 'patient') navigate('/patient/dashboard');
            else if (userRole === 'doctor') navigate('/doctor/dashboard');
            else navigate('/login');
        }
    };

    const handleLoginClick = () => {
        if (onLoginClick) {
            onLoginClick();
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="public-header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'white' }}>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="container flex-between">
                    <div className="flex-start" style={{ gap: '25px' }}>
                        <div className="flex-start"><Icons.Mail /> <span>contact@dibia.med</span></div>
                        <div className="flex-start"><Icons.Phone /> <span>+234 800 DIBIA MED</span></div>
                    </div>
                    <div className="flex-start" style={{ gap: '15px' }}>
                        <a href="#"><Icons.Facebook /></a>
                        <a href="#"><Icons.Twitter /></a>
                        <div style={{ marginLeft: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>ENGLISH/PIDGIN</div>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <nav className="navbar">
                <div className="container flex-between">
                    <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="IDIBIA" style={{ height: '50px', objectFit: 'contain' }} />
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <Icons.Close /> : <Icons.Menu />}
                    </button>

                    <div className={`nav-items-wrapper ${isMenuOpen ? 'open' : ''}`}>
                        <div className="nav-menu">
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/find-doctor" onClick={() => setIsMenuOpen(false)}>Find a Doctor</Link>
                            <Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link>
                            <Link to="/pharmacy" onClick={() => setIsMenuOpen(false)}>Pharmacy</Link>
                            <Link to="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                        </div>
                        {user ? (
                            <button className="btn btn-primary" onClick={handleDashboardClick}>Dashboard</button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleLoginClick}>Login</button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
