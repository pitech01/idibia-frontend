import { useState } from 'react';
import { api } from '../../services';
import './doctor.css'; // Reusing doctor styles

// Specific Icons for this verification flow
const Icons = {
    CheckCircle: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    LockClosed: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    DocumentText: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    CreditCard: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    ShieldCheck: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Spinner: () => <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
};

interface DoctorVerificationProps {
    onComplete: () => void;
}

export default function DoctorVerification({ onComplete }: DoctorVerificationProps) {
    const [step, setStep] = useState(2); // Start at step 2 (Step 1 assumed complete)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        specialty: '',
        experience_years: '',
        license_number: '',
        issuing_authority: 'MDCN', // Default
        practice_type: 'Hospital',
        workplace_name: '',
        city: '',
        state: '',
        consultation_type: 'both',
        bio: '',
        license_document: null as File | null,
        id_document: null as File | null
    });

    // Verification Mock State
    const [isVerifyingFolio, setIsVerifyingFolio] = useState(false);
    const [isFolioVerified, setIsFolioVerified] = useState(false);

    const handleExit = () => onComplete();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'license_number') {
            if (value.length > 5) {
                setIsVerifyingFolio(true);
                setTimeout(() => {
                    setIsVerifyingFolio(false);
                    setIsFolioVerified(true);
                }, 1500);
            } else {
                setIsFolioVerified(false);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'license_document' | 'id_document') => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== null) {
                    data.append(key, value);
                }
            });

            await api.post('/doctor/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStep(5); // Move to success step
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit verification request.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 2) {
            // Validate Step 2
            if (!formData.specialty || !formData.experience_years || !formData.license_number || !formData.issuing_authority || !formData.license_document) {
                setError("Please fill all required fields and upload your license.");
                return;
            }
            setError('');
            setStep(3);
        } else if (step === 3) {
            // Validate Step 3
            if (!formData.id_document) {
                setError("Please upload your government-issued ID.");
                return;
            }
            setError('');
            setStep(4);
        } else if (step === 4) {
            // Validate Step 4
            if (!formData.workplace_name || !formData.city || !formData.state) {
                setError("Please fill all practice details.");
                return;
            }
            handleSubmit();
        }
    };

    return (
        <div className="doc-verification-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>

            {/* Left Side - Aspirational Image */}
            <div style={{ flex: '1', background: '#0f172a', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Doctor" />
                </div>
                <div style={{ position: 'relative', zIndex: 10, color: 'white' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.1' }}>Practice with <br />Confidence.</h1>
                    <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '400px', lineHeight: '1.6' }}>Join IDIBIA's network of verified specialists. We prioritize trust and safety to protect both you and your patients.</p>
                </div>
            </div>

            {/* Right Side - Wizard Form */}
            <div style={{ flex: '1.2', background: 'white', padding: '60px 80px', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '100vh' }}>

                {/* Header - Progress Stepper */}
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Step Connectors */}
                    <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(Math.min(step, 5) - 1) * 25}%`, height: '2px', background: '#2563eb', zIndex: 0, transition: 'width 0.3s ease' }}></div>

                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: step >= num ? '#2563eb' : 'white',
                                border: step >= num ? 'none' : '2px solid #cbd5e1',
                                color: step >= num ? 'white' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px',
                                transition: 'all 0.3s'
                            }}>
                                {step > num ? <Icons.CheckCircle /> : num}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: step === num ? '600' : '400', color: step === num ? '#0f172a' : '#94a3b8' }}>
                                {num === 1 && 'Identity'}
                                {num === 2 && 'License'}
                                {num === 3 && 'ID Check'}
                                {num === 4 && 'Practice'}
                                {num === 5 && 'Status'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto', width: '100%' }}>

                    {/* Step 1 Summary (Completed) */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><Icons.ShieldCheck /></div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Identity Verified</h4>
                                <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>Via NIN <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                            </div>
                        </div>
                        {/* <button style={{ fontSize: '13px', color: '#64748b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button> */}
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Professional Credentials</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>Enter your medical practice details and upload your license.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="doc-label">Specialty</label>
                                        <input
                                            name="specialty"
                                            value={formData.specialty}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Cardiologist"
                                            className="doc-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="doc-label">Years of Experience</label>
                                        <input
                                            name="experience_years"
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 5"
                                            className="doc-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="doc-label">MDCN Folio Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="license_number"
                                            value={formData.license_number}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 78249"
                                            className="doc-input"
                                            style={{ borderColor: isFolioVerified ? '#16a34a' : '#cbd5e1' }}
                                        />
                                        <div style={{ position: 'absolute', right: '16px', top: '14px' }}>
                                            {isVerifyingFolio && <div style={{ color: '#3b82f6' }}><Icons.Spinner /></div>}
                                            {isFolioVerified && <span style={{ color: '#16a34a' }}><Icons.CheckCircle /></span>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="doc-label">Issuing Authority</label>
                                    <input
                                        name="issuing_authority"
                                        value={formData.issuing_authority}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Medical and Dental Council of Nigeria"
                                        className="doc-input"
                                    />
                                </div>

                                {/* Drag Drop Zone */}
                                <div>
                                    <label className="doc-label">Upload Practicing License</label>
                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '32px', textAlign: 'center', position: 'relative', background: '#f8fafc' }}>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'license_document')}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#475569' }}>
                                            <Icons.Upload />
                                        </div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                                            {formData.license_document ? formData.license_document.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>PDF or JPG (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Identity Verification</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>Please upload a valid government-issued ID to confirm your identity.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* ID Drop Zone */}
                                <div>
                                    <label className="doc-label">Upload Government ID</label>
                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '32px', textAlign: 'center', position: 'relative', background: '#f8fafc' }}>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'id_document')}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#475569' }}>
                                            <Icons.DocumentText />
                                        </div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                                            {formData.id_document ? formData.id_document.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>National ID, Passport, or Drivers License</p>
                                    </div>
                                </div>

                                <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                                    <div style={{ color: '#c2410c' }}><Icons.LockClosed /></div>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#9a3412', margin: 0 }}>Secure Verification</h4>
                                        <p style={{ fontSize: '13px', color: '#c2410c', margin: '4px 0 0', lineHeight: '1.4' }}>Your documents are encrypted and only accessible by our verification team.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Practice Details</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>Tell us about where you practice medicine.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label className="doc-label">Practice Type</label>
                                    <select
                                        name="practice_type"
                                        value={formData.practice_type}
                                        onChange={handleInputChange}
                                        className="doc-input"
                                    >
                                        <option value="Hospital">Hospital</option>
                                        <option value="Clinic">Clinic</option>
                                        <option value="Private Practice">Private Practice</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="doc-label">Workplace Name</label>
                                    <input
                                        name="workplace_name"
                                        value={formData.workplace_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Lagos University Teaching Hospital"
                                        className="doc-input"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="doc-label">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Ikeja"
                                            className="doc-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="doc-label">State</label>
                                        <input
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Lagos"
                                            className="doc-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="doc-label">Consultation Type</label>
                                    <select
                                        name="consultation_type"
                                        value={formData.consultation_type}
                                        onChange={handleInputChange}
                                        className="doc-input"
                                    >
                                        <option value="both">Both Virtual & Physical</option>
                                        <option value="virtual">Virtual Only</option>
                                        <option value="physical">Physical Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="doc-label">Professional Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Brief description about your experience..."
                                        className="doc-input"
                                        style={{ height: '100px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ width: '80px', height: '80px', background: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#d97706', border: '4px solid #fff7ed' }}>
                                <Icons.Clock />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>Verification in Progress</h2>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
                                Thank you for submitting your details. Our medical team is currently reviewing your documents. This usually takes <strong>24–48 hours</strong>.
                            </p>
                            <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}>
                                You will receive an email notification once your account is approved.
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {step < 5 && (
                        <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={handleExit} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Save & Exit</button>
                            <button
                                onClick={handleNext}
                                disabled={isLoading}
                                style={{
                                    background: isLoading ? '#cbd5e1' : '#2563eb',
                                    color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {isLoading && <Icons.Spinner />}
                                {step === 4 ? 'Submit Verification' : 'Continue'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
