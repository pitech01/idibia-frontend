import { useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { toast } from 'react-hot-toast';

const Icons = {
    Mail: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Phone: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    MapPin: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

export default function ContactUs({ user }: { user?: any }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            toast.success("Thank you! Your message has been sent. We'll get back to you shortly.", {
                duration: 5000,
                position: 'top-center',
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="contact-page" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <PublicNavbar user={user} />

            {/* Header */}
            <section style={{ background: '#0f172a', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>Get In Touch</h1>
                    <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        Have questions about our services or need medical assistance? We're here to help you 24/7.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="grid-2" style={{ gap: '60px' }}>
                        {/* Contact Form */}
                        <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                            <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '30px' }}>Send us a Message</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe"
                                        className="form-input-clean"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="john@example.com"
                                        className="form-input-clean"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Subject</label>
                                    <select 
                                        className="form-input-clean"
                                        value={formData.subject}
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Appointment Help">Appointment Help</option>
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Feedback">Feedback</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Message</label>
                                    <textarea 
                                        placeholder="How can we help you?"
                                        className="form-input-clean"
                                        rows={5}
                                        value={formData.message}
                                        onChange={e => setFormData({...formData, message: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'none' }}
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {isSubmitting ? 'Sending...' : <>Send Message <Icons.Send /></>}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '40px' }}>Contact Information</h2>
                            
                            <div style={{ display: 'grid', gap: '30px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E37A4', flexShrink: 0 }}>
                                        <Icons.MapPin />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '18px' }}>Our Location</h4>
                                        <p style={{ margin: 0, color: '#64748b' }}>123 Medical Avenue, Victoria Island, Lagos, Nigeria</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                                        <Icons.Phone />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '18px' }}>Phone Support</h4>
                                        <p style={{ margin: 0, color: '#64748b' }}>+234 800 DIBIA MED (34242 633)</p>
                                        <p style={{ margin: 0, color: '#64748b' }}>+234 901 234 5678</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                                        <Icons.Mail />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '18px' }}>Email Us</h4>
                                        <p style={{ margin: 0, color: '#64748b' }}>support@dibia.med</p>
                                        <p style={{ margin: 0, color: '#64748b' }}>contact@dibia.med</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                                        <Icons.Clock />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '18px' }}>Working Hours</h4>
                                        <p style={{ margin: 0, color: '#64748b' }}>Virtual Care: 24/7</p>
                                        <p style={{ margin: 0, color: '#64748b' }}>Physical Clinic: Mon - Sat (8am - 8pm)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Socials or Map Iframe could go here */}
                            <div style={{ marginTop: '50px', padding: '30px', background: '#2E37A4', borderRadius: '24px', color: 'white' }}>
                                <h4 style={{ margin: '0 0 10px' }}>Emergency?</h4>
                                <p style={{ margin: 0, opacity: 0.9 }}>For critical medical emergencies, please dial our direct emergency line: <b>+234 800 911 DIBIA</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
