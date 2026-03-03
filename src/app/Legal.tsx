import { useState, useEffect } from 'react';

const Icons = {
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Download: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
};

interface LegalProps {
    initialTab?: 'privacy' | 'terms';
    onBack: () => void;
}

export default function Legal({ initialTab = 'terms', onBack }: LegalProps) {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    return (
        <div className="legal-page-wrapper">
            {/* Top Bar / Header */}
            <div className="legal-header" style={{
                background: 'var(--primary-gradient)',
                padding: '120px 0 80px',
                color: 'white',
                textAlign: 'center',
                position: 'relative'
            }}>
                <button
                    onClick={onBack}
                    className="legal-back-btn"
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '600',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <Icons.ArrowLeft /> Back to Home
                </button>

                <div className="container">
                    <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Legal Information</h1>
                    <p style={{ opacity: 0.9, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                        Everything you need to know about our terms, privacy, and how we protect your data.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="legal-tabs-nav" style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: '0',
                zIndex: 100
            }}>
                <div className="container flex-center" style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                    <button
                        onClick={() => setActiveTab('terms')}
                        style={{
                            padding: '20px 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: activeTab === 'terms' ? 'var(--primary-color)' : '#64748b',
                            borderBottom: activeTab === 'terms' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Terms of Service
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        style={{
                            padding: '20px 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: activeTab === 'privacy' ? 'var(--primary-color)' : '#64748b',
                            borderBottom: activeTab === 'privacy' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Privacy Policy
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <section className="section-padding" style={{ background: '#f8fafc' }}>
                <div className="container">
                    <div className="legal-content-card" style={{
                        background: 'white',
                        padding: '60px',
                        borderRadius: '24px',
                        boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        <div className="flex-between" style={{ marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', color: 'var(--secondary-color)' }}>
                                    {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                                </h2>
                                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Last Updated: March 2026</p>
                            </div>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#f1f5f9',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#475569',
                                cursor: 'pointer'
                            }}>
                                <Icons.Download /> Download PDF
                            </button>
                        </div>

                        <div className="legal-text" style={{
                            color: '#334155',
                            lineHeight: '1.8',
                            fontSize: '16px'
                        }}>
                            {activeTab === 'terms' ? (
                                <div className="animate-fade-in">
                                    <h3 style={{ fontSize: '20px', marginBottom: '15px', color: 'var(--secondary-color)' }}>i-Dibia Mobile Clinic</h3>
                                    <p style={{ fontWeight: '600', marginBottom: '25px' }}>Effective Date: March 3, 2026</p>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>1. INTRODUCTION</h4>
                                        <p>Welcome to i-Dibia Mobile Clinic (“i-Dibia,” “we,” “our,” or “the Platform”). By accessing or using our telemedicine and mobile diagnostic services, you agree to these Terms of Service. If you do not agree, you must not use the platform.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>2. NATURE OF SERVICES</h4>
                                        <p>i-Dibia provides:</p>
                                        <ul style={{ listStyle: 'disc', marginLeft: '20px', marginTop: '10px' }}>
                                            <li>Virtual medical consultations</li>
                                            <li>Physical (in-person) consultations</li>
                                            <li>Mobile diagnostic services (ECG, ultrasound, echocardiography, laboratory tests)</li>
                                            <li>Health education and follow-up services</li>
                                        </ul>
                                        <p style={{ marginTop: '10px' }}>We operate as a healthcare facilitation platform connecting patients with licensed medical professionals.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>3. ELIGIBILITY</h4>
                                        <p>You must:</p>
                                        <ul style={{ listStyle: 'disc', marginLeft: '20px', marginTop: '10px' }}>
                                            <li>Be at least 18 years old, or</li>
                                            <li>Have parental/guardian consent if under 18</li>
                                        </ul>
                                        <p style={{ marginTop: '10px' }}>You confirm that all information provided is accurate.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px', padding: '20px', background: '#fff1f2', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
                                        <h4 style={{ color: '#e11d48', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ⚠️ 4. NO EMERGENCY SERVICES
                                        </h4>
                                        <p style={{ fontWeight: '600' }}>i-Dibia does NOT provide emergency medical services.</p>
                                        <p style={{ marginTop: '10px' }}>If you are experiencing a medical emergency, including severe chest pain, stroke symptoms, uncontrolled bleeding, or loss of consciousness, contact emergency services immediately or go to the nearest hospital.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>5. TELEMEDICINE LIMITATIONS</h4>
                                        <p>You acknowledge that:</p>
                                        <ul style={{ listStyle: 'disc', marginLeft: '20px', marginTop: '10px' }}>
                                            <li>Telemedicine depends on accurate patient-provided information.</li>
                                            <li>Technical issues may interrupt sessions.</li>
                                            <li>Some conditions require physical examination.</li>
                                            <li>Healthcare providers may recommend in-person hospital care where necessary.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>6. PAYMENT TERMS</h4>
                                        <p>Consultation and diagnostic fees must be paid before service delivery unless otherwise agreed. Refunds may be considered only in cases of verified technical failure or service cancellation by the platform. OTP verification or administrative charges may apply where necessary.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>7. PROFESSIONAL RESPONSIBILITY</h4>
                                        <p>All consultations are conducted by licensed medical professionals in accordance with ethical standards and regulations applicable in Nigeria. Clinical decisions are made independently by the consulting healthcare professional.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>8. USER CONDUCT</h4>
                                        <p>You agree not to:</p>
                                        <ul style={{ listStyle: 'disc', marginLeft: '20px', marginTop: '10px' }}>
                                            <li>Provide false medical information</li>
                                            <li>Abuse healthcare professionals</li>
                                            <li>Record consultations without consent</li>
                                            <li>Attempt unauthorized access to the platform</li>
                                        </ul>
                                        <p style={{ marginTop: '10px' }}>Violation may result in suspension.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>9. LIMITATION OF LIABILITY</h4>
                                        <p>To the maximum extent permitted by law: i-Dibia shall not be liable for indirect, incidental, or consequential damages. Medical outcomes depend on patient compliance and clinical variables beyond platform control.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>10. GOVERNING LAW</h4>
                                        <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved through mediation before litigation.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>11. MODIFICATIONS</h4>
                                        <p>We may update these Terms at any time. Continued use of the platform constitutes acceptance of the revised Terms.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px', padding: '25px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <h4 style={{ color: 'var(--secondary-color)', marginBottom: '15px' }}>12. TELEMEDICINE INFORMED CONSENT FORM</h4>
                                        <p style={{ fontWeight: '700', marginBottom: '10px' }}>i-Dibia Mobile Clinic Telemedicine Consent</p>
                                        <p>By proceeding with virtual consultation, I acknowledge and consent that:</p>
                                        <ul style={{ listStyle: 'disc', marginLeft: '20px', marginTop: '10px', marginBottom: '15px' }}>
                                            <li>Telemedicine involves remote communication via audio/video technology.</li>
                                            <li>The consulting doctor may not be physically present.</li>
                                            <li>There are potential risks including: Technical failure, Incomplete data transmission, Limitations in physical examination.</li>
                                        </ul>

                                        <p style={{ fontWeight: '600', marginTop: '15px' }}>I understand that:</p>
                                        <ul style={{ listStyle: 'circle', marginLeft: '20px', marginTop: '5px', marginBottom: '15px' }}>
                                            <li>Alternative in-person consultation is available.</li>
                                            <li>My medical records will be stored electronically.</li>
                                        </ul>

                                        <p style={{ fontWeight: '600', marginTop: '15px' }}>I consent to:</p>
                                        <ul style={{ listStyle: 'circle', marginLeft: '20px', marginTop: '5px', marginBottom: '15px' }}>
                                            <li>Electronic transmission of my health information.</li>
                                            <li>Recording of medical notes for continuity of care.</li>
                                        </ul>

                                        <p style={{ marginTop: '15px' }}>I understand I may withdraw consent at any time.</p>
                                        <p style={{ fontWeight: '700', marginTop: '15px', color: 'var(--primary-color)' }}>By clicking “I Consent,” I confirm that I have read and understood this document.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--secondary-color)' }}>Privacy Policy & Data Protection</h3>
                                    <p style={{ marginBottom: '25px' }}>Your privacy is paramount at i-Dibia Mobile Clinic. This policy outlines how we handle your medical and personal data in conjunction with our Terms of Service.</p>

                                    <div style={{ marginBottom: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginTop: 0 }}>DATA PROTECTION & NDPA COMPLIANCE CLAUSE</h4>
                                        <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>(Aligned with Nigerian Data Protection Act 2023)</p>

                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>DATA CONTROLLER</p>
                                            <p>i-Dibia Mobile Clinic acts as a Data Controller under the Nigerian Data Protection Act (NDPA) 2023.</p>
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>LAWFUL BASIS FOR PROCESSING</p>
                                            <p>We process personal and health data based on:</p>
                                            <ul style={{ listStyle: 'disc', marginLeft: '20px', fontSize: '14px' }}>
                                                <li>Explicit patient consent</li>
                                                <li>Medical necessity</li>
                                                <li>Legal obligations</li>
                                                <li>Public health requirements</li>
                                            </ul>
                                            <p style={{ marginTop: '5px', fontSize: '13px', fontStyle: 'italic' }}>Health data is classified as sensitive personal data under NDPA.</p>
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>DATA PROTECTION OFFICER (DPO)</p>
                                            <p>i-Dibia shall appoint a Data Protection Officer responsible for:</p>
                                            <ul style={{ listStyle: 'disc', marginLeft: '20px', fontSize: '14px' }}>
                                                <li>Monitoring NDPA compliance</li>
                                                <li>Conducting Data Protection Impact Assessments (DPIA)</li>
                                                <li>Managing data breach responses</li>
                                                <li>Handling data subject complaints</li>
                                            </ul>
                                            <p style={{ marginTop: '5px' }}>Contact: <a href="mailto:privacy@dibia.med" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>privacy@dibia.med</a></p>
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>DATA BREACH NOTIFICATION</p>
                                            <p>In the event of a data breach, affected users will be notified within the legally required timeframe, and the Nigeria Data Protection Commission (NDPC) will be notified where required.</p>
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>CROSS-BORDER DATA TRANSFER</p>
                                            <p>Where data is stored outside Nigeria, we ensure adequate safeguards and only NDPA-compliant jurisdictions or processors are used.</p>
                                        </div>

                                        <div>
                                            <p style={{ fontWeight: '700', marginBottom: '5px' }}>DATA RETENTION POLICY</p>
                                            <p>Medical records are retained in accordance with Nigerian healthcare regulations, MDCN guidelines, and applicable legal requirements.</p>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>1. EMERGENCY LIMITATIONS</h4>
                                        <p>In line with our clinical safety protocols, please note that i-Dibia is NOT for emergency use. Privacy of data is maintained, but in life-threatening situations, clinical necessity takes precedence to ensure you reach the nearest hospital.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>2. PROFESSIONAL RESPONSIBILITY</h4>
                                        <p>Access to your medical records is limited to licensed healthcare professionals directly involved in your care. All clinical decisions are independent and documented securely.</p>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>3. CONSENT</h4>
                                        <p>By using the platform, you provide explicit consent for the collection and processing of your health data for the purpose of medical consultations and diagnostics. You may withdraw this consent at any time, though it may limit our ability to provide services.</p>
                                    </div>

                                    <div style={{ marginTop: '40px', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '14px' }}>For deeper technical details on our data encryption and storage, please refer to the <button onClick={() => setActiveTab('terms')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '700', cursor: 'pointer', padding: 0 }}>Full Terms of Service</button>.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Tagline */}
            <footer style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                <div className="container">
                    <p>© 2026 i-Dibia Mobile Clinic. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
