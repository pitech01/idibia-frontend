import { useState } from 'react';
import { api, WEB_URL } from '../../services';
import { toast } from 'react-hot-toast';

// Reusing Icons
const Icons = {
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Plus: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Check: () => <svg width="40" height="40" fill="none" stroke="#22c55e" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
};

interface ChangePasswordProps {
    onBack: () => void;
    onLoginClick: () => void;
}

export default function ChangePassword({ onBack, onLoginClick }: ChangePasswordProps) {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get token and email from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: WEB_URL });
            await api.post('/reset-password', {
                token,
                email,
                password: formData.password,
                password_confirmation: formData.confirmPassword
            });
            setIsSuccess(true);
            toast.success('Password has been reset!');
            // Remove query params to clean up
            window.history.replaceState({}, document.title, '/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
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

                    <div className="image-panel-logo">
                        <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                            <Icons.Plus />
                        </div>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginLeft: '10px' }}>IDIBIA.</span>
                    </div>

                    <button onClick={onBack} className="btn-back-pill">
                        Cancel <Icons.ArrowLeft />
                    </button>

                    <div className="illustration-content">
                        <div className="illustration-text">
                            <h1>Secure your Account</h1>
                            <p>Create a strong new password to keep your account safe.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="login-form-container">
                    <div className="login-form-box">

                        {!isSuccess ? (
                            <>
                                <div className="login-header">
                                    <h2>Set New Password</h2>
                                    <p className="sub-text">Your new password must be different from previous used passwords.</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* New Password */}
                                    <div className="form-group">
                                        <div className="input-wrapper-dark">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                className="form-input-dark"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                minLength={8}
                                            />
                                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group">
                                        <div className="input-wrapper-dark">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm New Password"
                                                className="form-input-dark"
                                                value={formData.confirmPassword}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-login-main patient" disabled={loading}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{
                                    width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                                }}>
                                    <Icons.Check />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: '#0f172a' }}>Password Reset</h2>
                                <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>
                                    Your password has been successfully reset. <br /> Click below to log in securely.
                                </p>

                                <button onClick={onLoginClick} className="btn-login-main patient">
                                    Continue to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
