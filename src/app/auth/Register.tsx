import { useState, useEffect, useRef } from 'react';
import CustomDatePicker from '../../components/CustomDatePicker';
import { toast } from 'react-hot-toast';
import { api, WEB_URL } from '../../services';

// --- Icons ---
const Icons = {
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Check: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    File: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

// --- Types ---
type Role = 'patient' | 'doctor' | 'nurse';
type SubmissionStatus = 'draft' | 'pending_approval' | 'active';

interface RegistrationData {
    role: Role;
    submissionStatus: SubmissionStatus;

    // Step 1: Account

    email?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted: boolean;

    // Step 2: Verification
    isVerified: boolean;

    // Step 3: Personal
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    phone?: string; // Added for Doctor

    // Step 4 (Doctor): Professional
    specialty?: string;
    subSpecialty?: string;
    experienceYears?: string;
    license?: string;
    issuingAuthority?: string;

    // Step 5 (Doctor): Documents
    fileLicense?: string; // For display name
    fileLicenseObj?: File | null;
    fileId?: string; // For display name
    fileIdObj?: File | null;

    // Step 6 (Doctor): Practice
    practiceType?: string;
    workplaceName?: string;
    consultationType?: 'virtual' | 'physical' | 'both';
    bio?: string;

    // Step 4 (Patient): Health
    bloodGroup?: string;
    allergies?: string;
    conditions?: string;
    emergencyName?: string;
    emergencyPhone?: string;

    // Location (Shared)
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    virtualOnly: boolean;
}

const INITIAL_DATA: RegistrationData = {
    role: 'patient',
    submissionStatus: 'draft',
    termsAccepted: false,
    isVerified: false,
    virtualOnly: false
};

interface RegisterProps {
    onBack: () => void;
    onLoginClick: () => void;
    onRegisterSuccess: (role: 'patient' | 'doctor' | 'nurse', isCompleted?: boolean, isVerified?: boolean, userData?: any) => void;
}

export default function Register({ onBack, onLoginClick, onRegisterSuccess }: RegisterProps) {
    // --- STATE ---
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<Role>('patient');
    const [data, setData] = useState<RegistrationData>(INITIAL_DATA);
    const [showPassword, setShowPassword] = useState(false);

    // OTP Logic
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Helpers
    const updateData = (fields: Partial<RegistrationData>) => setData(prev => ({ ...prev, ...fields }));

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    // Resume Flow: Check for token on mount
    useEffect(() => {
        const checkExistingSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await api.get('/sanctum/csrf-cookie', { baseURL: WEB_URL });
                    const response = await api.get('/user');
                    const user = response.data;

                    if (user) {
                        // Pre-fill data
                        updateData({
                            firstName: user.name.split(' ')[0],
                            lastName: user.name.split(' ').slice(1).join(' '),
                            email: user.email,
                            isVerified: true, // If they have a token, they are verified
                            termsAccepted: true
                        });

                        // Handle Roles
                        if (user.role === 'doctor') {
                            setRole('doctor');
                            if (user.doctor) {
                                // Already has profile
                                if (user.doctor.status === 'active' || user.doctor.is_verified) {
                                    onRegisterSuccess('doctor', true, true, user);
                                } else {
                                    // Profile exists but not verified
                                    onRegisterSuccess('doctor', true, false, user);
                                }
                            } else {
                                // Resume Doctor Flow (Skip Account & Verify)
                                setStep(3);
                                toast("Welcome back! Let's finish your application.", { icon: '👨‍⚕️' });
                            }
                        } else if (user.role === 'patient') {
                            setRole('patient');
                            if (user.patient) {
                                const p = user.patient;
                                updateData({
                                    dob: p.dob, gender: p.gender, phone: p.phone,
                                    bloodGroup: p.blood_group, allergies: p.allergies, conditions: p.conditions,
                                    emergencyName: p.emergency_name, emergencyPhone: p.emergency_phone,
                                    address: p.address, city: p.city, state: p.state, country: p.country, zipCode: p.zip_code,
                                    virtualOnly: Boolean(p.virtual_only)
                                });

                                if (p.is_completed) {
                                    onRegisterSuccess('patient', true, true, user);
                                } else {
                                    setStep(3);
                                    toast("Welcome back! Let's finish your profile.", { icon: '👋' });
                                }
                            } else {
                                // User exists but no patient record
                                setStep(3);
                            }
                        }
                    }
                } catch (e) {
                    // Invalid token or session
                    localStorage.removeItem('token');
                }
            }
        };

        checkExistingSession();
    }, []);


    // Update data when role changes
    useEffect(() => {
        updateData({ role });
    }, [role]);

    // Reset and start timer when entering Step 2
    useEffect(() => {
        if (step === 2) {
            setTimer(30);
            setIsTimerRunning(true);
            sendOtp();
        }
    }, [step]);

    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const isSendingOtp = useRef(false);

    const sendOtp = async (isResend = false) => {
        if (data.isVerified || isSendingOtp.current) return;
        isSendingOtp.current = true;

        const toastId = toast.loading(isResend ? 'Resending code...' : 'Sending verification code...');
        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: WEB_URL });
            await api.post('/otp/send', { email: data.email });
            toast.success(isResend ? 'New code sent!' : 'Verification code sent!', { id: toastId });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to send code.';
            toast.error(message, { id: toastId });
        } finally {
            isSendingOtp.current = false;
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        const toastId = toast.loading('Verifying & Creating Account...');
        try {
            await api.post('/otp/verify', { email: data.email, code: otp });

            // OTP Verified. Now CREATE THE ACCOUNT immediately so they can "resume" later.
            // We register with basic info + OTP to prove we verified
            const response = await api.post('/register', {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                role: role, // Use selected role (patient or doctor)
                otp: otp,
                // Pass empty/null for others to keep profile incomplete
                is_completed: false
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            toast.success('Account Created! Let\'s setup your profile.', { id: toastId });
            updateData({ isVerified: true });
            nextStep(); // Move to Step 3
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid code or failed to create account', { id: toastId });
        }
    };

    const handlePatientSubmit = async () => {
        const toastId = toast.loading('Finishing up...');

        try {
            // We are now "Logged In", so we use PUT /profile (mapped from ProfileController@update)
            // We need to map frontend camelCase to backend snake_case as expected by ProfileController
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email, // Should match auth user
                phone: data.phone, // Though patient flow didn't ask for phone? 
                // Wait, patient step 3 asks for DOB/Gender, Step 4 asks for emergency.
                dob: data.dob,
                gender: data.gender,
                blood_group: data.bloodGroup,
                allergies: data.allergies, // ProfileController might need update to accept these or they are in patient relation
                conditions: data.conditions,
                emergency_name: data.emergencyName,
                emergency_phone: data.emergencyPhone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                zip_code: data.zipCode,
                virtual_only: data.virtualOnly
            };

            const response = await api.put('/profile', payload);
            const updatedUser = response.data.user || response.data;

            toast.success(<b>Registration Complete! Welcome.</b>, { id: toastId });
            setTimeout(() => onRegisterSuccess('patient', true, true, updatedUser), 2000);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Could not update profile. Please try again.';
            toast.error(<b>{message}</b>, { id: toastId });
        }
    };

    const handleDoctorSubmit = async () => {
        const toastId = toast.loading('Submitting application...');

        try {
            const formData = new FormData();
            formData.append('specialty', data.specialty || '');
            formData.append('experience_years', data.experienceYears || '');
            formData.append('license_number', data.license || '');
            formData.append('issuing_authority', data.issuingAuthority || '');
            formData.append('practice_type', data.practiceType || '');
            formData.append('workplace_name', data.workplaceName || '');
            formData.append('city', data.city || '');
            formData.append('state', data.state || '');
            formData.append('consultation_type', data.consultationType || 'both');
            formData.append('bio', data.bio || '');

            if (data.fileLicenseObj) {
                formData.append('license_document', data.fileLicenseObj);
            }
            if (data.fileIdObj) {
                formData.append('id_document', data.fileIdObj);
            }

            // Note: Sending FormData often requires setting Content-Type to multipart/form-data, 
            // but Axios/browser usually handles this automatically if data is FormData.
            // However, we need to ensure the sanctum token is attached (which 'api' instance does).

            const response = await api.post('/doctor/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = response.data.user || response.data;

            toast.success("Application Submitted for Review!", { id: toastId });
            // Doctor is completed but NOT verified
            setTimeout(() => onRegisterSuccess('doctor', true, false, updatedUser), 1500);

        } catch (error: any) {
            const message = error.response?.data?.message || 'Submission failed. Please try again.';
            toast.error(message, { id: toastId });
        }
    };

    // --- RENDER SUCCESS STATE ---


    // ... existing Role Config ...
    const roleConfig = {
        patient: {
            title: "Join as Patient",
            welcome: "Start your journey to better health.",
            color: "#0ea5e9", // Sky Blue
        },
        doctor: {
            title: "Join as Doctor",
            welcome: "Expand your practice with Idibia.",
            color: "#2563eb", // Royal Blue
        },
        nurse: {
            title: "Join as Nurse",
            welcome: "Assist and care efficiently.",
            color: "#4f46e5", // Indigo/Deep Blue
        }
    };

    // --- STEPS ---

    // STEP 1: Create Account
    const renderStep1 = () => (
        <div>
            {/* Mobile Header (Visible only on mobile via CSS) */}
            <div className="mobile-auth-header">
                <img src="/logo.png" alt="IDIBIA" style={{ height: '40px', objectFit: 'contain' }} />
                <button onClick={onBack} className="btn-back-simple">
                    <Icons.ArrowLeft /> Back
                </button>
            </div>

            <div className="login-header">
                <h2>Create Account</h2>
                <p className="sub-text">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>Log in</a></p>
            </div>

            {/* Role Tabs */}
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

            <form onSubmit={(e) => {
                e.preventDefault();
                if (role === 'patient' || role === 'doctor') {
                    nextStep();
                } else {
                    alert('Nurse flow coming soon');
                }
            }}>
                <div className="row-2">
                    <div className="form-group">
                        <div className="input-wrapper-dark">
                            <input type="text" placeholder="First Name" className="form-input-dark" value={data.firstName || ''} onChange={e => updateData({ firstName: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper-dark">
                            <input type="text" placeholder="Last Name" className="form-input-dark" value={data.lastName || ''} onChange={e => updateData({ lastName: e.target.value })} required />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-wrapper-dark">
                        <input type="email" placeholder="Email Address" className="form-input-dark" value={data.email || ''} onChange={e => updateData({ email: e.target.value, isVerified: false })} required />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-wrapper-dark">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="form-input-dark" value={data.password || ''} onChange={e => updateData({ password: e.target.value })} required />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-wrapper-dark">
                        <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="form-input-dark" value={data.confirmPassword || ''} onChange={e => updateData({ confirmPassword: e.target.value })} required />
                    </div>
                </div>

                <div className="login-options">
                    <label className="checkbox-container">
                        <input type="checkbox" required checked={data.termsAccepted} onChange={e => updateData({ termsAccepted: e.target.checked })} />
                        <span className="checkmark"><Icons.Check /></span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>I agree to the Terms & Privacy Policy</span>
                    </label>
                </div>

                <button type="submit" className={`btn-login-main ${role}`} disabled={!data.termsAccepted}>
                    {role === 'nurse' ? "Create Account" : "Continue"}
                </button>
            </form>
        </div>
    );

    // STEP 2: Verification (OTP)
    // STEP 2: Verification (OTP)
    const renderStep2 = () => {
        if (data.isVerified) {
            return (
                <div className="text-center">
                    <h2 className="step-title">Email Verified!</h2>
                    <div style={{ margin: '30px auto', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p style={{ marginTop: '5px', color: '#334155', fontSize: '15px' }}>Your email <b>{data.email}</b> has been verified.</p>
                    </div>
                    <button className={`btn-login-main ${role}`} onClick={nextStep}>Continue to Profile</button>
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={prevStep} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
                            Change Email
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center">
                <h2 className="step-title">Verify Email</h2>
                <p className="step-desc">Enter the code sent to <b>{data.email}</b></p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Check your spam folder if you don't see it.</p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="otp-input"
                        placeholder="- - - - - -"
                        style={{ maxWidth: '200px', letterSpacing: '8px' }}
                    />
                </div>

                <button className={`btn-login-main ${role}`} onClick={handleVerify} disabled={otp.length !== 6}>Verify Account</button>

                <div style={{ marginTop: '20px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
                    {timer > 0 ? (
                        <p className="timer-text">
                            Resend code in <span style={{ color: '#0077B6', fontWeight: 'bold' }}>{timer}s</span>
                        </p>
                    ) : (
                        <button
                            onClick={() => { setTimer(30); setIsTimerRunning(true); sendOtp(true); }}
                            style={{ border: 'none', background: 'none', color: '#0077B6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Resend Code
                        </button>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button onClick={prevStep} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
                        Change Email
                    </button>
                </div>
            </div>
        );
    };

    // STEP 3: Personal Info
    const renderStep3 = () => (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 className="step-title" style={{ marginBottom: 0 }}>Personal Details</h2>
                </div>
                {/* Logout Option for Resumed Sessions */}
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('appView');
                    localStorage.removeItem('userRole');
                    window.location.reload();
                }} style={{ fontSize: '12px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Logout / Reset
                </button>
            </div>

            <p className="step-desc">Tell us more about yourself.</p>

            <div className="row-2">
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-input-clean" value={data.firstName || ''} onChange={e => updateData({ firstName: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="form-input-clean" value={data.lastName || ''} onChange={e => updateData({ lastName: e.target.value })} />
                </div>
            </div>

            <div className="form-group">
                <label>Date of Birth</label>
                <CustomDatePicker
                    value={data.dob}
                    onChange={date => updateData({ dob: date })}
                    placeholder="Select Date of Birth"
                />
            </div>

            <div className="form-group">
                <label>Gender</label>
                <select className="form-input-clean" value={data.gender || ''} onChange={e => updateData({ gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            {role === 'doctor' && (
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" className="form-input-clean" placeholder="+234..." value={data.phone || ''} onChange={e => updateData({ phone: e.target.value })} />
                </div>
            )}

            <button
                className={`btn-login-main ${role}`}
                onClick={nextStep}
                disabled={!data.firstName || !data.lastName || !data.dob || !data.gender || (role === 'doctor' && !data.phone)}
            >
                Next Step
            </button>
        </div>
    );

    // --- DOCTOR FLOW SPECIFIC STEPS ---

    // STEP 4: Professional (Doctor)
    const renderDoctorStep4 = () => (
        <div>
            <h2 className="step-title">Professional Details</h2>
            <p className="step-desc">Your medical qualifications.</p>

            <div className="form-group">
                <label>Specialty</label>
                <select className="form-input-clean" value={data.specialty || ''} onChange={e => updateData({ specialty: e.target.value })}>
                    <option value="">Select Specialty</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                </select>
            </div>

            <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" className="form-input-clean" placeholder="e.g. 5" value={data.experienceYears || ''} onChange={e => updateData({ experienceYears: e.target.value })} />
            </div>

            <div className="form-group">
                <label>Medical License Number (MDCN)</label>
                <input type="text" className="form-input-clean" placeholder="License #" value={data.license || ''} onChange={e => updateData({ license: e.target.value })} />
            </div>

            <div className="form-group">
                <label>Issuing Authority</label>
                <input type="text" className="form-input-clean" value={data.issuingAuthority || ''} onChange={e => updateData({ issuingAuthority: e.target.value })} />
            </div>

            <button className={`btn-login-main ${role}`} onClick={nextStep}>Next Step</button>
        </div>
    );

    // STEP 5: Documents (Doctor)
    // STEP 5: Documents (Doctor)
    const renderDoctorStep5 = () => (
        <div>
            <h2 className="step-title">Documents</h2>
            <p className="step-desc">Upload validation documents.</p>

            <label className="upload-box" style={{ display: 'block' }}>
                <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            updateData({ fileLicense: file.name, fileLicenseObj: file });
                        }
                    }}
                />
                <Icons.Upload />
                <p>{data.fileLicense ? data.fileLicense : "Upload Medical License"}</p>
                <span>PDF, JPG or PNG</span>
            </label>

            <label className="upload-box" style={{ display: 'block' }}>
                <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            updateData({ fileId: file.name, fileIdObj: file });
                        }
                    }}
                />
                <Icons.Upload />
                <p>{data.fileId ? data.fileId : "Upload Government ID"}</p>
                <span>Valid Passport, NIN or Driver's License</span>
            </label>

            <button className={`btn-login-main ${role}`} onClick={nextStep} style={{ marginTop: '20px' }} disabled={!data.fileLicenseObj || !data.fileIdObj}>Next Step</button>
        </div>
    );

    // STEP 6: Practice (Doctor)
    const renderDoctorStep6 = () => (
        <div>
            <h2 className="step-title">Practice Details</h2>
            <p className="step-desc">Where do you practice?</p>

            <div className="form-group">
                <label>Practice Type</label>
                <select className="form-input-clean" value={data.practiceType || ''} onChange={e => updateData({ practiceType: e.target.value })}>
                    <option value="">Select Type</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Independent">Independent / Private</option>
                </select>
            </div>

            <div className="form-group">
                <label>Workplace Name</label>
                <input type="text" className="form-input-clean" value={data.workplaceName || ''} onChange={e => updateData({ workplaceName: e.target.value })} />
            </div>

            <div className="row-2">
                <div className="form-group">
                    <label>State</label>
                    <select className="form-input-clean" value={data.state || ''} onChange={e => updateData({ state: e.target.value })}>
                        <option value="">Select State</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input type="text" className="form-input-clean" value={data.city || ''} onChange={e => updateData({ city: e.target.value })} />
                </div>
            </div>

            <div className="form-group">
                <label>Consultation Preference</label>
                <select className="form-input-clean" value={data.consultationType || 'both'} onChange={e => updateData({ consultationType: e.target.value as any })}>
                    <option value="both">Both Virtual & Physical</option>
                    <option value="virtual">Virtual Only</option>
                    <option value="physical">Physical Only</option>
                </select>
            </div>

            <button className={`btn-login-main ${role}`} onClick={nextStep}>Next Step</button>
        </div>
    );

    // STEP 7: Review (Doctor)
    const renderDoctorStep7 = () => (
        <div>
            <h2 className="step-title">Review & Submit</h2>
            <p className="step-desc">Your account will be reviewed.</p>

            <div className="review-card">
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Professional</h4>
                        <button onClick={() => setStep(4)}>Edit</button>
                    </div>
                    <p>{data.specialty} ({data.experienceYears} Years)</p>
                    <p>License: {data.license}</p>
                </div>
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Practice</h4>
                        <button onClick={() => setStep(6)}>Edit</button>
                    </div>
                    <p>{data.workplaceName} ({data.practiceType})</p>
                    <p>{data.city}, {data.state}</p>
                </div>
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Documents</h4>
                        <button onClick={() => setStep(5)}>Edit</button>
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.File /> {data.fileLicense || 'Missing'}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.File /> {data.fileId || 'Missing'}</p>
                </div>
            </div>

            <div className="security-note" style={{ marginTop: '20px', fontSize: '13px', color: '#64748b', background: '#f1f5f9', padding: '10px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                <Icons.Shield />
                <span>Verification may take up to 24-48 hours.</span>
            </div>

            <button className={`btn-login-main ${role}`} onClick={handleDoctorSubmit} style={{ marginTop: '20px' }}>Submit for Verification</button>
        </div>
    );

    // --- PATIENT FLOW SPECIFIC STEPS ---

    // STEP 4: Health (Patient)
    const renderPatientStep4 = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="step-title" style={{ margin: 0 }}>Health Profile</h2>
                <button onClick={nextStep} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Skip →</button>
            </div>
            <p className="step-desc">Optional medical details.</p>

            <div className="form-group">
                <label>Blood Group</label>
                <select className="form-input-clean" value={data.bloodGroup || ''} onChange={e => updateData({ bloodGroup: e.target.value })}>
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>

            <div className="form-group">
                <label>Known Allergies</label>
                <input type="text" className="form-input-clean" placeholder="e.g. Peanuts" value={data.allergies || ''} onChange={e => updateData({ allergies: e.target.value })} />
            </div>

            <div className="form-group">
                <label>Conditions</label>
                <input type="text" className="form-input-clean" placeholder="e.g. Asthma" value={data.conditions || ''} onChange={e => updateData({ conditions: e.target.value })} />
            </div>

            <div className="divider"><span>Emergency Contact</span></div>

            <div className="form-group">
                <input
                    type="text"
                    className="form-input-clean"
                    placeholder="Contact Name"
                    value={data.emergencyName || ''}
                    onChange={e => updateData({ emergencyName: e.target.value })}
                    style={{ marginBottom: '10px' }}
                />
                <input
                    type="tel"
                    className="form-input-clean"
                    placeholder="Contact Phone (e.g. 08012345678)"
                    value={data.emergencyPhone || ''}
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 15) updateData({ emergencyPhone: val });
                    }}
                />
            </div>

            <button
                className={`btn-login-main ${role}`}
                onClick={nextStep}
                disabled={!data.emergencyName || !data.emergencyPhone}
            >
                Next Step
            </button>
        </div>
    );

    // STEP 5: Location (Patient)
    const renderPatientStep5 = () => (
        <div>
            <h2 className="step-title">Location</h2>
            <p className="step-desc">Where are you currently residing?</p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Residential Address</label>
                <textarea
                    className="form-input-clean"
                    rows={2}
                    placeholder="Enter full street address"
                    value={data.address || ''}
                    onChange={e => updateData({ address: e.target.value })}
                    style={{ resize: 'none' }}
                />
            </div>

            <div className="row-2" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Country</label>
                    <select className="form-input-clean" value={data.country || 'Nigeria'} onChange={e => updateData({ country: e.target.value })}>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>State / Province</label>
                    <select className="form-input-clean" value={data.state || ''} onChange={e => updateData({ state: e.target.value })}>
                        <option value="">Select State</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Kano">Kano</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div className="row-2" style={{ marginBottom: '25px' }}>
                <div className="form-group">
                    <label>City</label>
                    <input type="text" className="form-input-clean" placeholder="e.g. Ikeja" value={data.city || ''} onChange={e => updateData({ city: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Zip Code</label>
                    <input type="text" className="form-input-clean" placeholder="e.g. 100001" value={data.zipCode || ''} onChange={e => updateData({ zipCode: e.target.value })} />
                </div>
            </div>



            <button
                className={`btn-login-main ${role}`}
                onClick={nextStep}
                disabled={!data.address || !data.state || !data.city || !data.zipCode}
            >
                Next Step
            </button>
        </div>
    );

    // STEP 6: Review (Patient)
    const renderPatientStep6 = () => (
        <div>
            <h2 className="step-title">Review Details</h2>
            <p className="step-desc">Confirm everything is correct.</p>

            <div className="review-card">
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Account</h4>
                        <button onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <p>{data.firstName} {data.lastName}</p>
                    <p>{data.email}</p>
                </div>
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Health</h4>
                        <button onClick={() => setStep(4)}>Edit</button>
                    </div>
                    <p>{data.bloodGroup || 'Not set'}</p>
                    <p>{data.emergencyName ? `Emergency: ${data.emergencyName}` : 'No emergency contact'}</p>
                </div>
                <div className="review-section">
                    <div className="rev-header">
                        <h4>Location</h4>
                        <button onClick={() => setStep(5)}>Edit</button>
                    </div>
                    <p>{data.city}, {data.state}</p>
                    <p>{data.virtualOnly ? 'Virtual Only' : 'In-person & Virtual'}</p>
                </div>
            </div>

            <button className={`btn-login-main ${role}`} onClick={handlePatientSubmit}>Complete Registration</button>
        </div>
    );

    // --- PENDING APPROVAL VIEW ---
    if (data.submissionStatus === 'pending_approval') {
        return (
            <div className="login-wrapper">
                <style>{`
                    .pending-box { text-align: center; padding: 40px 20px; }
                    .pending-icon { width: 80px; height: 80px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
                    .contact-support { margin-top: 30px; font-size: 14px; color: #64748b; }
                    .contact-support a { color: #0284c7; font-weight: 600; text-decoration: none; }
                 `}</style>
                <div className="login-box-centered" style={{ minHeight: '500px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="pending-box">
                        <div className="pending-icon">
                            <Icons.Shield />
                        </div>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#1e293b' }}>Submission Received</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                            Thank you, <b>Dr. {data.lastName}</b>. Your profile is currently under review.
                            Our team validates all medical licenses within 24-48 hours.
                        </p>
                        <div className="contact-support">
                            Need help? <a href="#">Contact Support</a>
                        </div>
                        <button className="btn-back-pill" style={{ marginTop: '30px', position: 'static' }} onClick={() => window.location.reload()}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-wrapper">
            <style>{`
                /* Reuse existing styles plus Step specific */
                .step-title { font-size: 22px; color: #1e293b; margin-bottom: 5px; font-weight: 700; }
                .step-desc { color: #64748b; margin-bottom: 25px; font-size: 14px; }
                
                .form-input-clean { width: 100%; padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; outline: none; transition: 0.2s; color: #1e293b; background: #f8fafc; margin-top: 5px; }
                .form-input-clean:focus { border-color: #0077B6; background: white; box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.1); }
                
                .otp-input { letter-spacing: 12px; font-size: 24px; text-align: center; font-weight: 700; color: #0077B6; border: 2px solid #e2e8f0; border-radius: 12px; padding: 15px; width: 100%; margin-bottom: 20px; }
                
                .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .form-group label { display: block; font-size: 13px; font-weight: 600; color: #334155; }
                .form-group { margin-bottom: 20px; }

                .review-card { background: #f1f5f9; padding: 15px; border-radius: 12px; font-size: 14px; }
                .review-section { margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
                .rev-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .rev-header h4 { font-weight: 700; color: #0077B6; text-transform: uppercase; font-size: 12px; }
                .rev-header button { border: none; background: none; color: #64748b; font-size: 12px; cursor: pointer; text-decoration: underline; }
                
                .toggle-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 15px; background: #f8fafc; }
                .toggle-card h4 { margin: 0; font-size: 14px; font-weight: 600; }
                .toggle-card p { margin: 0; font-size: 12px; color: #64748b; }

                .upload-box { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; margin-bottom: 15px; background: #f8fafc; }
                .upload-box:hover { border-color: #0077B6; background: #f0f9ff; }
                .upload-box svg { color: #0077B6; margin-bottom: 10px; }
                .upload-box p { font-weight: 600; font-size: 14px; color: #334155; margin: 0 0 5px; }
                .upload-box span { font-size: 12px; color: #94a3b8; }

                /* Role Tabs */
                .role-tabs { display: flex; justify-content: space-around; margin-bottom: 25px; background: #f1f5f9; border-radius: 8px; padding: 5px; }
                .role-tab { flex: 1; padding: 10px 15px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 600; color: #64748b; border-radius: 6px; transition: all 0.2s ease; }
                .role-tab.active { background: white; color: #0077B6; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

                /* Dynamic button colors */
                /* Enhanced Button Animations */
                @keyframes subtle-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }

                .btn-login-main { 
                    width: 100%; 
                    color: white; 
                    padding: 14px; 
                    border-radius: 10px; 
                    font-weight: 600; 
                    font-size: 16px; 
                    border: none; 
                    cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .btn-login-main:disabled { 
                    opacity: 0.6; 
                    cursor: not-allowed; 
                    filter: grayscale(0.2);
                    transform: scale(0.98);
                }

                .btn-login-main:not(:disabled) {
                    animation: subtle-pulse 3s infinite;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .btn-login-main:not(:disabled):hover {
                    animation: none;
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .btn-login-main:not(:disabled):active {
                    transform: translateY(0) scale(0.98);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .btn-login-main.patient { background-color: #0ea5e9; } 
                .btn-login-main.patient:hover:not(:disabled) { background-color: #0284c7; }
                
                .btn-login-main.doctor { background-color: #2563eb; }
                .btn-login-main.doctor:hover:not(:disabled) { background-color: #1d4ed8; }
                
                .btn-login-main.nurse { background-color: #4f46e5; }
                .btn-login-main.nurse:hover:not(:disabled) { background-color: #4338ca; }

                /* Dynamic illustration background colors */
                .login-illustration.patient .illustration-overlay { background: linear-gradient(to top, #0ea5e9, #38bdf8); }
                .login-illustration.doctor .illustration-overlay { background: linear-gradient(to top, #2563eb, #3b82f6); }
                .login-illustration.nurse .illustration-overlay { background: linear-gradient(to top, #4f46e5, #6366f1); }
             `}</style>

            <div className="login-box-centered">
                {/* Left Side */}
                <div className={`login-illustration ${role}`}>
                    <div className="illustration-overlay"></div>
                    <div className="image-panel-logo" style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '12px' }}>
                        <img src="/logo.png" alt="IDIBIA" style={{ height: '40px', objectFit: 'contain' }} />
                    </div>
                    <button onClick={onBack} className="btn-back-pill">
                        Back to website <Icons.ArrowLeft />
                    </button>
                    <div className="illustration-content">
                        <div className="illustration-text">
                            <h1>{roleConfig[role].title}</h1>
                            <p>{step === 1 ? roleConfig[role].welcome : `Step ${step} of ${role === 'patient' ? 6 : 7}`}</p>

                            {/* Dynamic Progress Dots */}
                            {step >= 1 && (
                                <div className="role-indicators" style={{ marginTop: '10px' }}>
                                    {Array.from({ length: role === 'patient' ? 6 : 7 }).map((_, i) => {
                                        const s = i + 1;
                                        return <span key={s} className={step >= s ? 'active' : ''} style={{ width: step === s ? '20px' : '8px', height: '8px', borderRadius: '4px', background: 'white', opacity: step >= s ? 1 : 0.4, display: 'inline-block', margin: '0 3px', transition: 'all 0.3s' }}></span>;
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="login-form-container">
                    <div className="login-form-box">
                        {step > 1 && (
                            <button onClick={prevStep} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                <Icons.ArrowLeft /> Back
                            </button>
                        )}

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        {/* Role Specific Flow Divergence */}
                        {role === 'patient' && (
                            <>
                                {step === 4 && renderPatientStep4()}
                                {step === 5 && renderPatientStep5()}
                                {step === 6 && renderPatientStep6()}
                            </>
                        )}

                        {role === 'doctor' && (
                            <>
                                {step === 4 && renderDoctorStep4()}
                                {step === 5 && renderDoctorStep5()}
                                {step === 6 && renderDoctorStep6()}
                                {step === 7 && renderDoctorStep7()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
