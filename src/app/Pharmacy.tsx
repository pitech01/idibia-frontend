import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    Pharmacy: () => <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function Pharmacy({ user }: { user?: any }) {
    const navigate = useNavigate();

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <PublicNavbar user={user} />
            <div style={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px', 
                textAlign: 'center' 
            }}>
            <div className="pharmacy-splash animate-fade-in" style={{ 
                background: 'white', padding: '60px 40px', borderRadius: '40px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', maxWidth: '600px', width: '100%'
            }}>
                <div style={{ 
                    width: '140px', height: '140px', background: '#dcfce7', color: '#059669',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 40px'
                }}>
                    <Icons.Pharmacy />
                </div>
                
                <span style={{ 
                    background: '#ecfdf5', color: '#059669', padding: '8px 20px', 
                    borderRadius: '30px', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase',
                    letterSpacing: '2px', display: 'inline-block', marginBottom: '24px'
                }}>Coming Soon</span>
                
                <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Your Online Pharmacy is Under Construction</h1>
                <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '40px' }}>
                    We are working hard to bring a full-scale digital pharmacy to your fingertips. 
                    Soon you'll be able to order genuine medications and have them delivered to your doorstep.
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ 
                            padding: '16px 32px', background: '#f1f5f9', color: '#0f172a', 
                            borderRadius: '16px', border: 'none', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <Icons.ArrowLeft /> Back to Home
                    </button>
                    <button 
                        className="btn btn-primary"
                        style={{ padding: '16px 32px', borderRadius: '16px' }}
                    >
                        Notify Me
                    </button>
                </div>
            </div>
            </div>
            <PublicFooter />
        </div>
    );
}
