import { useState, useEffect } from 'react';
import { api } from '../../services';
import Preloader from '../../components/Preloader';
import { toast } from 'react-hot-toast';

const Icons = {
    Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Calendar: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Wallet: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Star: () => <svg width="24" height="24" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    Video: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    VideoSmall: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Coffee: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 1v3" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 1v3" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 1v3" /></svg>,
    Edit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Beaker: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
};

interface DoctorOverviewProps {
    setActiveTab: (tab: string) => void;
}

export default function DoctorOverview({ setActiveTab }: DoctorOverviewProps) {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/doctor/dashboard');
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <Preloader />;

    const { stats, today_schedule, recent_patient, user } = dashboardData || {};

    return (
        <div className="doc-content animate-fade-in">
            {/* Greeting Banner */}
            <div className="doc-banner">
                <div className="doc-banner-text">
                    <h1>Good Morning, Dr. {user?.last_name || 'Doctor'}</h1>
                    <p>Have a nice day at work</p>
                </div>
                {/* ... (illustration code unchanged) ... */}
                <div style={{ position: 'relative', width: '300px', height: '140px' }}>
                    <svg width="300" height="140" viewBox="0 0 300 140" fill="none">
                        <path d="M220 140V60C220 60 230 40 250 40C270 40 280 60 280 60V140H220Z" fill="#e2e8f0" />
                        <rect x="230" y="70" width="40" height="50" fill="#cbd5e1" rx="2" />
                        <circle cx="250" cy="30" r="15" fill="#1e293b" />
                        <path d="M250 45C235 45 225 60 225 80H275C275 60 265 45 250 45Z" fill="#3b82f6" />
                        <circle cx="50" cy="20" r="4" fill="#cbd5e1" />
                        <circle cx="70" cy="40" r="4" fill="#cbd5e1" />
                        <circle cx="30" cy="60" r="4" fill="#cbd5e1" />
                    </svg>
                </div>
            </div>

            {/* Stats Row */}
            <div className="doc-stats-grid">
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#ffedd5', color: '#c2410c' }}>
                        <div style={{ position: 'relative' }}>
                            <Icons.Clock />
                            {stats?.pending_requests > 0 && (
                                <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>
                            )}
                        </div>
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.pending_requests || 0}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
                        <Icons.Calendar />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.today_appointments || 0}</h3>
                        <p>Today's Appts</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <Icons.Wallet />
                    </div>
                    <div className="stat-info">
                        <h3>₦{(stats?.earnings || 0).toLocaleString()}</h3>
                        <p>Earnings (Jan)</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                        <Icons.Star />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.rating || 0} <small style={{ color: '#ca8a04' }}>★</small></h3>
                        <p>Rating</p>
                    </div>
                </div>
            </div>

            <div className="doc-grid-split">
                {/* Left Column */}
                <div>
                    {/* Patient Card */}
                    {recent_patient ? (
                        <div className="doc-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <img
                                        src={recent_patient.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop"}
                                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                                        alt="Patient"
                                    />
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                                            {recent_patient.first_name} {recent_patient.last_name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                            <span
                                                onClick={() => setActiveTab('patients')}
                                                style={{ fontSize: 12, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Review Patient
                                            </span>
                                            <span style={{ fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>Recent</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Icons.VideoSmall /> Last interaction recently
                                        </div>
                                    </div>
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                    <button
                                        onClick={() => toast.success('Starting secure video consultation...')}
                                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                    >
                                        <Icons.Video /> Start Video Consult
                                    </button>
                                    <button
                                        onClick={() => toast('Voice call feature coming soon', { icon: '📞' })}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <Icons.Phone /> Call Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="doc-card">
                            <p style={{ textAlign: 'center', color: '#64748b' }}>No recent patient activity.</p>
                        </div>
                    )}

                    {/* Unread Messages */}
                    <div className="doc-card">
                        <div className="doc-card-header">
                            <span className="doc-card-title">Unread Messages <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: 6, fontSize: 12, marginLeft: 6 }}>1</span></span>
                            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>View All</a>
                        </div>
                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, display: 'flex', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: '#e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.Message />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>System</span>
                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Now</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#64748b' }}>Welcome to your new dashboard.</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="doc-card" style={{ marginBottom: 0 }}>
                        <div className="doc-card-header">
                            <span className="doc-card-title">Quick Actions</span>
                        </div>
                        <div className="quick-action-grid">
                            <button className="btn-quick-action" onClick={() => setActiveTab('patients')}>
                                <Icons.Edit />
                                <span>Write Prescription</span>
                            </button>
                            <button className="btn-quick-action" onClick={() => setActiveTab('schedule')}>
                                <Icons.Calendar />
                                <span>Update Availability</span>
                            </button>
                            <button className="btn-quick-action" onClick={() => setActiveTab('patients')}>
                                <Icons.Beaker />
                                <span>Request Lab</span>
                            </button>
                            <button className="btn-quick-action" onClick={() => setActiveTab('messages')}>
                                <Icons.Message />
                                <span>Send Message</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Schedule */}
                <div className="doc-card" style={{ height: 'fit-content' }}>
                    <div className="doc-card-header">
                        <span className="doc-card-title">Today's Schedule</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>📅 Today</span>
                    </div>

                    <div className="timeline-list">
                        {today_schedule && today_schedule.length > 0 ? (
                            today_schedule.map((appt: any, idx: number) => (
                                <div className="timeline-item" key={appt.id}>
                                    <div className="timeline-line"></div>
                                    <div className="timeline-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><Icons.VideoSmall /></div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">
                                            {appt.start_time.substring(0, 5)}
                                            {idx === 0 && <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600, fontSize: 10, marginLeft: 4 }}>Next</span>}
                                        </div>
                                        <h4>{appt.patient?.first_name} {appt.patient?.last_name}</h4>
                                        <p>{appt.reason || 'General Consultation'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="timeline-item">
                                <div className="timeline-content">
                                    <p>No appointments today.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
