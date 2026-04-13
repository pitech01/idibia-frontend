import { useState } from 'react';
import { api, WEB_URL } from '../../services';
import { toast } from 'react-hot-toast';

const Icons = {
    ShieldCheck: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

interface SuperAdminLoginProps {
    onBack: () => void;
    onLoginSuccess: (role: 'super-admin', isCompleted?: boolean, isVerified?: boolean, userData?: any) => void;
}

export default function SuperAdminLogin({ onBack, onLoginSuccess }: SuperAdminLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        const toastId = toast.loading('Establishing Secure Session...');

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: WEB_URL });

            const response = await api.post('/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.token) {
                const userRole = response.data.user?.role;

                if (userRole !== 'super-admin') {
                    toast.error(<b>Restricted: Only Super Administrators can proceed.</b>, { id: toastId });
                    setIsLoggingIn(false);
                    return;
                }

                localStorage.setItem('token', response.data.token);
                toast.success(<b>Super Admin Access Granted.</b>, { id: toastId });

                setTimeout(() => {
                    onLoginSuccess('super-admin', true, true, response.data.user);
                }, 1000);
            }
        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error(error.response?.data?.message || 'Authentication failed.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ background: '#020617' }}>
            <div className="login-box-centered" style={{ background: '#020617' }}>
                <div className="login-illustration" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', borderRight: '1px solid #1e293b' }}>
                    <div className="image-panel-logo" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src="/logo.png" alt="IDIBIA" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
                    </div>

                    <button onClick={onBack} className="btn-back-pill" style={{ color: '#94a3b8' }}>
                        <Icons.ArrowLeft /> Exit Security Area
                    </button>

                    <div className="illustration-content">
                        <div className="illustration-text">
                            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Icons.ShieldCheck /> <span style={{ fontWeight: '800', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase' }}>High Security Zone</span>
                            </div>
                            <h1 style={{ color: '#f8fafc' }}>System Authority</h1>
                            <p style={{ color: '#94a3b8' }}>Universal control and system-wide configuration panel for IDIBIA Health Platform.</p>
                        </div>
                    </div>
                </div>

                <div className="login-form-container" style={{ background: '#020617' }}>
                    <div className="login-form-box fade-in-up">
                        <div className="login-header">
                            <h2 style={{ color: '#f8fafc' }}>Super Admin</h2>
                            <p style={{ color: '#64748b' }}>Please enter your root credentials.</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <div className="input-wrapper-dark" style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                    <input
                                        type="email"
                                        placeholder="Admin Identity"
                                        style={{ background: 'transparent', color: '#f8fafc', border: 'none', padding: '16px', width: '100%', outline: 'none' }}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="input-wrapper-dark" style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Secure Key"
                                        style={{ background: 'transparent', color: '#f8fafc', border: 'none', padding: '16px', width: '100%', outline: 'none' }}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ color: '#475569', padding: '16px' }}>
                                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoggingIn} className="btn-login-main" style={{ background: '#f59e0b', color: '#020617', fontWeight: '800', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px' }}>
                                {isLoggingIn ? 'Authorizing...' : 'Initialize Access'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
