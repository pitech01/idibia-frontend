import { useState } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

// Reusing Icons
const Icons = {
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Plus: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
};

interface ForgotPasswordProps {
    onBack: () => void;
    onLoginClick: () => void;
    onCodeVerified?: () => void;
}

export default function ForgotPassword({ onBack, onLoginClick }: ForgotPasswordProps) {
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
            await api.post('/forgot-password', { email });
            setIsEmailSent(true);
            toast.success('Reset link sent to your email!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box-centered">
                {/* Left Side - Image Panel */}
                <div className="login-illustration patient">
                    <div className="illustration-overlay"></div>

                    {/* Top Left Logo */}
                    <div className="image-panel-logo" style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '12px' }}>
                        <img src="/logo.png" alt="IDIBIA" style={{ height: '40px', objectFit: 'contain' }} />
                    </div>

                    {/* Top Right Back Button */}
                    <button onClick={onBack} className="btn-back-pill">
                        Back to website <Icons.ArrowLeft />
                    </button>

                    <div className="illustration-content">
                        <div className="illustration-text">
                            <h1>Account Recovery</h1>
                            <p>Don't worry, we'll help you get back access to your IDIBIA account.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="login-form-container">
                    <div className="login-form-box">

                        {!isEmailSent ? (
                            <>
                                {/* Header */}
                                <div className="login-header">
                                    <h2>Forgot Password?</h2>
                                    <p className="sub-text">Enter your email address to receive a password reset link.</p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleEmailSubmit}>
                                    <div className="form-group">
                                        <div className="input-wrapper-dark">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                className="form-input-dark"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                            <div style={{ position: 'absolute', right: '15px', color: '#94a3b8' }}>
                                                <Icons.Mail />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-login-main patient" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <>
                                <div className="login-header">
                                    <h2>Check Your Email</h2>
                                    <p className="sub-text">We sent a password reset link to <strong style={{ color: '#0ea5e9' }}>{email}</strong></p>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <p style={{ marginBottom: '20px', color: '#64748b', fontSize: '14px' }}>
                                        Follow the link in the email to reset your password.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsEmailSent(false)}
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                                    >
                                        Use a different email
                                    </button>
                                </div>
                            </>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="#"
                                onClick={(e) => { e.preventDefault(); onLoginClick(); }}
                                style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Icons.ArrowLeft /> Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
