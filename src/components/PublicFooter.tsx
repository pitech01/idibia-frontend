import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services';
import { toast } from 'react-hot-toast';

export default function PublicFooter() {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        try {
            await api.post('/subscribe', { email });
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Subscription failed. Please try again.');
        } finally {
            setIsSubscribing(false);
        }
    };
    return (
        <footer className="footer">
            <div className="container">
                <div className="grid-4">
                    <div>
                        <div className="nav-logo" style={{ marginBottom: '20px' }}>
                            <img src="/logo.png" alt="IDIBIA" style={{ height: '40px', objectFit: 'contain', background: 'white', padding: '5px', borderRadius: '8px' }} />
                        </div>
                        <p style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '14px' }}>
                            Your trusted online pharmacy and healthcare partner. We provide genuine medications, expert consultations, and seamless health management for you and your family.
                        </p>
                    </div>

                    <div>
                        <h3>Our Services</h3>
                        <ul style={{ lineHeight: '2.2', fontSize: '14px' }}>
                            <li><Link to="/specialties/angioplasty">Angioplasty</Link></li>
                            <li><Link to="/specialties/cardiology">Cardiology</Link></li>
                            <li><Link to="/specialties/dental">Dental</Link></li>
                            <li><Link to="/specialties/endocrinology">Endocrinology</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3>Useful Links</h3>
                        <ul style={{ lineHeight: '2.2', fontSize: '14px' }}>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/blog">Latest News</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3>Quick Links</h3>
                        <ul style={{ lineHeight: '2.2', fontSize: '14px' }}>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/team">Team</Link></li>
                            <li><Link to="/services">Services</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Bar */}
                <div className="newsletter-wrapper">
                    <div className="newsletter-text">
                        <h3 style={{ margin: 0 }}>Important Updates Waiting for you</h3>
                        <p style={{ opacity: 0.7, fontSize: '14px' }}>Get our latest and best contents right into your inbox</p>
                    </div>
                    <form className="newsletter-bar" onSubmit={handleSubscribe}>
                        <input 
                            type="email" 
                            placeholder="Your Email Address" 
                            className="newsletter-input" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="newsletter-btn" disabled={isSubscribing} style={{ opacity: isSubscribing ? 0.7 : 1 }}>
                            {isSubscribing ? '...' : 'Subscribe Now'}
                        </button>
                    </form>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 IDIBIA Med. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
