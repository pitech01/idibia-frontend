import { useState, useEffect } from 'react';
import { api } from '../../services';
import '../patient/patient.css'; // Reuse basic dashboard styles for consistency

// Basic Icons
const Icons = {
    Grid: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Calendar: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Construction: () => <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Alert: () => <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" /></svg>,
    Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
};

interface PendingDashboardProps {
    role: 'doctor' | 'nurse';
    onLogout: () => void;
}

export default function PendingDashboard({ role, onLogout }: PendingDashboardProps) {
    const [userStatus, setUserStatus] = useState<string>('pending_approval');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/user');
                if (role === 'doctor' && res.data.doctor) {
                    setUserStatus(res.data.doctor.status);
                }
            } catch (err) {
                console.error("Failed to fetch status", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [role]);

    const roleTitle = role === 'doctor' ? "Doctor's Workspace" : "Nurse Station";
    const isRejected = userStatus === 'rejected';
    const primaryColor = isRejected ? '#dc2626' : (role === 'doctor' ? '#2563eb' : '#4f46e5');

    return (
        <div className="dashboard-container" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Back Button (Logout) Essentially acting as Back to Login */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                    onClick={onLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#475569',
                        fontWeight: '500'
                    }}
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Login
                </button>
            </div>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{
                    background: 'white',
                    padding: '60px 40px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <div style={{
                        width: '80px', height: '80px', 
                        background: isRejected ? '#fef2f2' : '#f1f5f9', 
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        color: primaryColor
                    }}>
                        {isRejected ? <Icons.Alert /> : (role === 'doctor' ? <Icons.Grid /> : <Icons.Construction />)}
                    </div>

                    {loading ? (
                        <p style={{ color: '#64748b' }}>Checking application status...</p>
                    ) : role === 'doctor' ? (
                        <>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: isRejected ? '#991b1b' : '#0f172a', marginBottom: '12px' }}>
                                {isRejected ? 'Application Rejected' : 'Application Pending'}
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                                {isRejected ? (
                                    <>
                                        We regret to inform you that your application has been rejected after review. <br />
                                        Please contact support for further information.
                                    </>
                                ) : (
                                    <>
                                        Thanks for submitting your application, Doc! <br />
                                        Our team is currently reviewing your documents. You will be notified via email once approved.
                                    </>
                                )}
                            </p>
                            <div style={{ 
                                marginTop: '30px', 
                                padding: '16px', 
                                background: isRejected ? '#fef2f2' : '#ecfdf5', 
                                borderRadius: '12px', 
                                fontSize: '14px', 
                                color: isRejected ? '#dc2626' : '#059669', 
                                display: 'inline-block',
                                border: `1px solid ${isRejected ? '#fee2e2' : '#d1fae5'}`
                            }}>
                                Status: <strong>{isRejected ? 'Rejected' : 'Under Review'}</strong>
                            </div>
                            
                            {isRejected && (
                                <div style={{ marginTop: '24px' }}>
                                    <button 
                                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                        onClick={() => window.location.href = 'mailto:support@idibia.com'}
                                    >
                                        Contact Support
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                                Coming Soon
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                                The <strong>{roleTitle}</strong> is currently under development. <br />
                                We are working hard to bring you a premium experience.
                            </p>
                            <div style={{ marginTop: '30px', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '14px', color: '#64748b', display: 'inline-block' }}>
                                Status: <strong>In Progress</strong>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
