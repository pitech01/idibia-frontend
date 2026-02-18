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
    CheckCircle: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

interface DoctorOverviewProps {
    setActiveTab: (tab: string) => void;
}

export default function DoctorOverview({ setActiveTab }: DoctorOverviewProps) {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionProcessing, setActionProcessing] = useState<number | null>(null);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/doctor/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleStartConsultation = async (id: number) => {
        setActionProcessing(id);
        const toastId = toast.loading("Starting consultation...");
        try {
            await api.post(`/appointments/${id}/start`);
            toast.success("Consultation Started! Patient notified.", { id: toastId });
            fetchDashboard(); // Refresh to update status
        } catch (error: any) {
            console.error("Start Error:", error);
            toast.error(error.response?.data?.message || "Failed to start consultation", { id: toastId });
        } finally {
            setActionProcessing(null);
        }
    };

    const handleCompleteConsultation = async (id: number) => {
        setActionProcessing(id);
        const toastId = toast.loading("Completing consultation & processing earnings...");
        try {
            await api.post(`/appointments/${id}/complete`);
            toast.success("Consultation Completed! Earnings added to your wallet.", { id: toastId });
            fetchDashboard(); // Refresh to update status
        } catch (error: any) {
            console.error("Completion Error:", error);
            toast.error(error.response?.data?.message || "Failed to complete consultation", { id: toastId });
        } finally {
            setActionProcessing(null);
        }
    };

    if (loading) return <Preloader />;

    const { stats, today_schedule, recent_appointment, user } = dashboardData || {};
    const recentPatient = recent_appointment?.patient;

    // Helper to calculate end time
    const getEndTime = (startTime: string, duration: number) => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        date.setMinutes(date.getMinutes() + (duration || 30));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="doc-content animate-fade-in">
            {/* Greeting Banner */}
            <div className="doc-banner">
                <div className="doc-banner-text">
                    <h1>Good Morning, Dr. {user?.name || 'Doctor'}</h1>
                    <p>Have a nice day at work</p>
                </div>
                <div style={{ position: 'relative', width: '300px', height: '140px' }}>
                    <svg width="300" height="150" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background Elements */}
                        <circle cx="280" cy="20" r="50" fill="#e0f2fe" fillOpacity="0.5" />
                        <circle cx="10" cy="120" r="30" fill="#f0f9ff" fillOpacity="0.6" />

                        {/* Abstract Medical Cross/Shape */}
                        <path d="M250 40H270V60H290V80H270V100H250V80H230V60H250V40Z" fill="#bae6fd" fillOpacity="0.3" />

                        {/* Doctor Figure Illustration */}
                        <g transform="translate(180, 20)">
                            {/* Torso/Coat */}
                            <path d="M30 130V60C30 50 40 45 60 45C80 45 90 50 90 60V130H30Z" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                            <path d="M60 45V130" stroke="#f1f5f9" strokeWidth="2" />
                            {/* Stethoscope */}
                            <path d="M45 60C45 60 45 90 60 90C75 90 75 60 75 60" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="60" cy="95" r="4" fill="#94a3b8" />
                            {/* Head */}
                            <circle cx="60" cy="25" r="18" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                            <path d="M50 30Q60 35 70 30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                        </g>

                        {/* Floating Icons */}
                        <g transform="translate(60, 40)">
                            <circle cx="0" cy="0" r="15" fill="white" filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05))" />
                            <path d="M-5 0H5M0 -5V5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                        </g>

                        <g transform="translate(100, 100)">
                            <circle cx="0" cy="0" r="12" fill="white" filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05))" />
                            <path d="M-4 -2L0 4L5 -4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>

                        {/* Sparkles/Decorations */}
                        <path d="M40 80L42 75L44 80L49 82L44 84L42 89L40 84L35 82L40 80Z" fill="#facc15" />
                        <circle cx="140" cy="30" r="3" fill="#cbd5e1" />
                        <circle cx="160" cy="110" r="2" fill="#cbd5e1" />
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
                    {/* Patient Card - Active Appointment */}
                    {recent_appointment ? (
                        <div className="doc-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <img
                                        src={recentPatient?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop"}
                                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                                        alt="Patient"
                                    />
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                                            {recentPatient?.name || 'Patient'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <span
                                                onClick={() => setActiveTab('patients')}
                                                style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Review Patient
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                background: recent_appointment.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                                                color: recent_appointment.status === 'ongoing' ? '#166534' : '#475569',
                                                padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase'
                                            }}>
                                                {recent_appointment.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Icons.VideoSmall /> {recent_appointment.type} • {recent_appointment.start_time} - {getEndTime(recent_appointment.start_time, recent_appointment.duration)} ({recent_appointment.duration || 30} mins)
                                        </div>
                                    </div>
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                    {recent_appointment.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleStartConsultation(recent_appointment.id)}
                                            disabled={actionProcessing === recent_appointment.id}
                                            style={{
                                                background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px',
                                                borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                opacity: actionProcessing === recent_appointment.id ? 0.7 : 1
                                            }}
                                        >
                                            <Icons.Video /> Start Consult
                                        </button>
                                    )}

                                    {recent_appointment.status === 'ongoing' && (
                                        <button
                                            onClick={() => handleCompleteConsultation(recent_appointment.id)}
                                            disabled={actionProcessing === recent_appointment.id}
                                            style={{
                                                background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px',
                                                borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                opacity: actionProcessing === recent_appointment.id ? 0.7 : 1
                                            }}
                                        >
                                            <Icons.CheckCircle /> Complete & Finish
                                        </button>
                                    )}

                                    {recent_appointment.status === 'completed' && (
                                        <button
                                            disabled
                                            style={{
                                                background: '#94a3b8', color: 'white', border: 'none', padding: '10px 20px',
                                                borderRadius: 8, fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 8
                                            }}
                                        >
                                            <Icons.CheckCircle /> Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="doc-card">
                            <p style={{ textAlign: 'center', color: '#64748b' }}>No active appointments.</p>
                        </div>
                    )}



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
                            today_schedule.map((appt: any) => (
                                <div className="timeline-item" key={appt.id}>
                                    <div className="timeline-line"></div>
                                    <div className="timeline-icon" style={{
                                        background: appt.status === 'ongoing' ? '#dcfce7' : '#dbeafe',
                                        color: appt.status === 'ongoing' ? '#166534' : '#2563eb'
                                    }}>
                                        <Icons.VideoSmall />
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">
                                            {appt.start_time.substring(0, 5)}
                                            {appt.status === 'ongoing' && <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600, fontSize: 10, marginLeft: 4 }}>LIVE</span>}
                                        </div>
                                        <h4>{appt.patient?.name || 'Unknown Patient'}</h4>
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
