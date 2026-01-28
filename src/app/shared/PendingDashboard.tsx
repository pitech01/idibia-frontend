
import '../patient/patient.css'; // Reuse basic dashboard styles for consistency

// Basic Icons
const Icons = {
    Grid: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Calendar: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Construction: () => <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
};

interface PendingDashboardProps {
    role: 'doctor' | 'nurse';
    onLogout: () => void;
}

export default function PendingDashboard({ role, onLogout }: PendingDashboardProps) {

    const roleTitle = role === 'doctor' ? "Doctor's Workspace" : "Nurse Station";
    const primaryColor = role === 'doctor' ? '#2563eb' : '#4f46e5';

    return (
        <div className="dashboard-container" style={{ background: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Back Button (Logout) essentially acting as Back to Login */}
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
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    background: 'white',
                    padding: '60px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '90%'
                }}>
                    <div style={{
                        width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        color: primaryColor
                    }}>
                        {role === 'doctor' ? <Icons.Grid /> : <Icons.Construction />}
                    </div>

                    {role === 'doctor' ? (
                        <>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                                Application Pending
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                                Thanks for submitting your application, Doc! <br />
                                Our team is currently reviewing your documents. You will be notified via email once approved.
                            </p>
                            <div style={{ marginTop: '30px', padding: '16px', background: '#ecfdf5', borderRadius: '12px', fontSize: '14px', color: '#059669', display: 'inline-block' }}>
                                Status: <strong>Under Review</strong>
                            </div>
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
