import { useState } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';


// Reusing Icons from index.tsx or defining locally for portability
const Icons = {
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Check: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Plus: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
};

type Role = 'patient' | 'doctor' | 'nurse';

interface LoginProps {
    onBack: () => void;
    onRegisterClick: () => void;
    onForgotPasswordClick: () => void;
    onLoginSuccess: (role: Role) => void;
}

export default function Login({ onBack, onRegisterClick, onForgotPasswordClick, onLoginSuccess }: LoginProps) {
    const [role, setRole] = useState<Role>('patient');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Dynamic content based on role
    const roleConfig = {
        patient: {
            title: "Patient Portal",
            welcome: "Manage your health journey with ease.",
            color: "#0ea5e9", // Sky Blue
            btnClass: "btn-role-patient"
        },
        doctor: {
            title: "Doctor's Workspace",
            welcome: "Access patient records and schedule.",
            color: "#2563eb", // Royal Blue
            btnClass: "btn-role-doctor"
        },
        nurse: {
            title: "Nurse Station",
            welcome: "Track vitals and administer care.",
            color: "#4f46e5", // Indigo/Deep Blue
            btnClass: "btn-role-nurse"
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        const toastId = toast.loading('Logging in...');

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });

            const response = await api.post('/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.token) {
                const userRole = response.data.user?.role;

                // Role mismatch check
                if (userRole && userRole !== role) {
                    toast.error(<b>Access Denied: Not a {role} account.</b>, { id: toastId });
                    setIsLoggingIn(false);
                    return; // Stop execution
                }

                localStorage.setItem('token', response.data.token);
                toast.success(<b>Welcome back!</b>, { id: toastId });

                // Allow a brief moment for toast to show before redirecting/updating state
                setTimeout(() => {
                    onLoginSuccess(role);
                }, 1000);
            }
        } catch (error: any) {
            // console.error('Login error:', error); // Removed for cleaner production feel

            let message = 'An unexpected error occurred.';

            if (error.response) {
                // Server responded with a status code outside 2xx
                if (error.response.status === 422) {
                    // Validation Error (e.g. Email not formatted correctly)
                    const firstError = Object.values(error.response.data.errors || {})[0] as string[];
                    message = firstError ? firstError[0] : error.response.data.message;
                } else if (error.response.status === 401) {
                    // Unauthorized (Invalid credentials)
                    message = 'Incorrect email or password.';
                } else {
                    message = error.response.data.message || 'Server error. Please try again.';
                }
            } else if (error.request) {
                // Request made but no response (Network error)
                message = 'Cannot connect to server. Check your internet.';
            }

            toast.error(<b>{message}</b>, { id: toastId });
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box-centered">
                {/* Left Side - Image Panel */}
                <div className={`login-illustration ${role}`}>
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
                            <h1>{roleConfig[role].title}</h1>
                            <p>{roleConfig[role].welcome}</p>

                            {/* Pagination/Role Indicators */}
                            <div className="role-indicators">
                                <span className={role === 'patient' ? 'active' : ''}></span>
                                <span className={role === 'doctor' ? 'active' : ''}></span>
                                <span className={role === 'nurse' ? 'active' : ''}></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="login-form-container">
                    <div className="login-form-box fade-in-up">
                        {/* Header */}
                        <div className="login-header">
                            <h2>Welcome back</h2>
                            <p className="sub-text">Please enter your details to sign in.</p>
                            <p className="sub-text" style={{ marginTop: '10px' }}>
                                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onRegisterClick(); }}>Sign up</a>
                            </p>
                        </div>

                        {/* Role Tabs (Maintaining Functionality) */}
                        <div className="role-tabs">
                            {(['patient', 'doctor', 'nurse'] as Role[]).map((r) => (
                                <button
                                    key={r}
                                    className={`role-tab ${role === r ? 'active' : ''}`}
                                    onClick={() => setRole(r)}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        {/* Form */}
                        <form onSubmit={handleLogin}>
                            {/* Email */}
                            <div className="form-group">
                                <div className="input-wrapper-dark">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="form-input-dark"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <div className="input-wrapper-dark">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="form-input-dark"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                            </div>

                            <div className="login-options">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    />
                                    <span className="checkmark"><Icons.Check /></span>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>Remember me</span>
                                </label>
                                <a href="#" onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }} className="forgot-password">Forgot Password?</a>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={isLoggingIn} className={`btn-login-main ${role}`} style={{ opacity: isLoggingIn ? 0.7 : 1 }}>
                                {isLoggingIn ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
}
