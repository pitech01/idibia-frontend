import { useState, useEffect } from 'react';
import { api } from '../../services';
import Preloader from '../../components/Preloader';
import { toast } from 'react-hot-toast';
import WebRTCCall from '../../components/WebRTCCall';

const Icons = {
    Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Calendar: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Wallet: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Star: () => <svg width="24" height="24" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    Video: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    VideoSmall: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Coffee: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 1v3" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 1v3" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 1v3" /></svg>,
    Edit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Beaker: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    CheckCircle: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    TrendingUp: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></svg>
};

interface DoctorOverviewProps {
    setActiveTab: (tab: string) => void;
}

export default function DoctorOverview({ setActiveTab }: DoctorOverviewProps) {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionProcessing, setActionProcessing] = useState<number | null>(null);
    const [showWebRTCCall, setShowWebRTCCall] = useState(false);
    const [activeCallAppointment, setActiveCallAppointment] = useState<any>(null);
    const [quote, setQuote] = useState('');

    const quotes = [
        "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
        "The art of medicine consists of amusing the patient while nature cures the disease.",
        "Wherever the art of medicine is loved, there is also a love of humanity.",
        "Always remember the privilege it is to be a healer.",
        "Medicine is a science of uncertainty and an art of probability.",
        "The good physician treats the disease; the great physician treats the patient who has the disease.",
        "Your dedication to health is changing lives every single day.",
        "Focus on the patient, not just the symptom.",
        "Every patient is a new opportunity to learn and to heal.",
        "Kindness is the best medicine for the soul."
    ];

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
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const handleStartConsultation = async (id: number) => {
        setActionProcessing(id);
        const toastId = toast.loading("Connecting to patient...");
        try {
            const res = await api.post(`/appointments/${id}/start`);
            toast.success("Connection Established! Patient notified.", { id: toastId });
            
            // Auto open call UI if data available
            if (res.data.appointment) {
                setActiveCallAppointment(res.data.appointment);
                setShowWebRTCCall(true);
            }
            fetchDashboard(); 
        } catch (error: any) {
            console.error("Start Error:", error);
            toast.error(error.response?.data?.message || "Failed to start consultation", { id: toastId });
        } finally {
            setActionProcessing(null);
        }
    };

    const handleCompleteConsultation = async (id: number) => {
        setActionProcessing(id);
        const toastId = toast.loading("Finalizing session...");
        try {
            await api.post(`/appointments/${id}/complete`);
            toast.success("Session Fulfilled! Earnings processed.", { id: toastId });
            fetchDashboard(); 
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

    return (
        <div className="doc-content animate-fade-in">
            {showWebRTCCall && activeCallAppointment && (
                <WebRTCCall
                    appointmentId={activeCallAppointment.id}
                    userId={user?.id}
                    userName={user?.name || 'Doctor'}
                    receiverId={activeCallAppointment.patient_id}
                    isDoctor={true}
                    onClose={() => {
                        setShowWebRTCCall(false);
                        setActiveCallAppointment(null);
                        fetchDashboard();
                    }}
                />
            )}
            {/* Premium Greeting Banner */}
            <div className="doc-banner" style={{ border: 'none', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
                <div className="doc-banner-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Inspiration</span>
                        <span style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic', fontWeight: '500' }}>"{quote}"</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: '32px' }}>Welcome back, Dr. {user?.name || 'Doctor'}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>Your medical dashboard is ready. You have {stats?.today_appointments || 0} consultations scheduled for today.</p>
                </div>
                <div className="desktop-only" style={{ position: 'relative', width: '220px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(46, 55, 164, 0.3) 0%, transparent 70%)' }}></div>
                     <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', textAlign: 'center' }}>
                         <div style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', marginBottom: '4px' }}>PLATFORM RATING</div>
                         <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{stats?.rating || '5.0'} <small style={{ fontSize: '16px', color: '#fbbf24' }}>★</small></div>
                         <div style={{ fontSize: '11px', color: '#64748b' }}>Top 5% of Providers</div>
                     </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="doc-stats-grid">
                {[
                    { label: 'Pending Requests', val: stats?.pending_requests || 0, icon: <Icons.Clock />, color: '#f97316', bg: '#fff7ed', trend: 'Response needed' },
                    { label: "Today's Appts", val: stats?.today_appointments || 0, icon: <Icons.Calendar />, color: '#2563eb', bg: '#eff6ff', trend: '+12% from avg' },
                    { label: 'Total Earnings', val: `₦${(stats?.earnings || 0).toLocaleString()}`, icon: <Icons.Wallet />, color: '#16a34a', bg: '#f0fdf4', trend: 'Payout scheduled' },
                    { label: 'Patient Reviews', val: '98%', icon: <Icons.Star />, color: '#ca8a04', bg: '#fefce8', trend: 'Positive sentiment' }
                ].map((s, idx) => (
                    <div key={idx} className="doc-stat-card" style={{ border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', transition: 'transform 0.3s ease' }}>
                        <div className="stat-icon-box" style={{ background: s.bg, color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="stat-info">
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>{s.label}</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{s.val}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                                <Icons.TrendingUp /> {s.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="doc-grid-split">
                {/* Left: Active Consultation */}
                <div>
                    <div className="doc-card" style={{ padding: '32px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
                        <div className="doc-card-header" style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Priority Session</h2>
                            {recent_appointment?.status === 'ongoing' && (
                                <div style={{ padding: '4px 12px', background: '#ef4444', color: 'white', borderRadius: '30px', fontSize: '10px', fontWeight: '900', animation: 'pulse 2s infinite' }}>LIVE NOW</div>
                            )}
                        </div>

                        {recent_appointment ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={recentPatient?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop"}
                                            style={{ width: 80, height: 80, borderRadius: '20px', objectFit: 'cover', border: '4px solid #f8fafc' }}
                                            alt="Patient"
                                        />
                                        <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', padding: '2px 8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '10px', fontWeight: '800', color: '#2E37A4', whiteSpace: 'nowrap' }}>ID: {recent_appointment.id}</div>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{recentPatient?.name || 'Valued Patient'}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.VideoSmall /> {recent_appointment.type}</span>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{recent_appointment.start_time}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span onClick={() => setActiveTab('patients')} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>View History</span>
                                            <span style={{ fontSize: '11px', background: recent_appointment.status === 'ongoing' ? '#dcfce7' : '#f1f5f9', color: recent_appointment.status === 'ongoing' ? '#166534' : '#475569', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', textTransform: 'uppercase' }}>{recent_appointment.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Reason for Consult</div>
                                    <p style={{ fontSize: '14px', color: '#334155', margin: 0, fontWeight: '500', lineHeight: '1.6' }}>"{recent_appointment.reason || 'General health check-up and routine follows up.'}"</p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {recent_appointment.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleStartConsultation(recent_appointment.id)}
                                            disabled={actionProcessing === recent_appointment.id}
                                            style={{
                                                flex: 1, background: 'linear-gradient(135deg, #2E37A4 0%, #1e2894 100%)', color: 'white', border: 'none', padding: '16px',
                                                borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                boxShadow: '0 10px 15px -3px rgba(46, 55, 164, 0.3)', transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <Icons.Video /> Start Consultation
                                        </button>
                                    )}
                                    {recent_appointment.status === 'ongoing' && (
                                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => {
                                                    setActiveCallAppointment(recent_appointment);
                                                    setShowWebRTCCall(true);
                                                }}
                                                style={{
                                                    flex: 1, background: '#2E37A4', color: 'white', border: 'none', padding: '16px',
                                                    borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                                }}
                                            >
                                                <Icons.Video /> Join Session
                                            </button>
                                            <button
                                                onClick={() => handleCompleteConsultation(recent_appointment.id)}
                                                disabled={actionProcessing === recent_appointment.id}
                                                style={{
                                                    flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '16px',
                                                    borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                    boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)', transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <Icons.CheckCircle /> Complete
                                            </button>
                                        </div>
                                    )}
                                    {recent_appointment.status === 'completed' && (
                                        <div style={{ flex: 1, padding: '16px', background: '#f0fdf4', color: '#16a34a', borderRadius: '12px', textAlign: 'center', fontWeight: '800', border: '1px solid #dcfce7' }}>Session Fulfilled</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icons.Calendar /></div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Clear Schedule</h3>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>No upcoming sessions for this slot.</p>
                            </div>
                        )}
                    </div>

                    <div className="doc-card">
                         <div className="doc-card-header">
                            <span className="doc-card-title">Intelligent Insights</span>
                        </div>
                        <div className="quick-action-grid">
                            {[
                                { label: 'Prescriptions', icon: <Icons.Edit />, action: () => setActiveTab('patients') },
                                { label: 'Shift Roster', icon: <Icons.Calendar />, action: () => setActiveTab('schedule') },
                                { label: 'Lab Reports', icon: <Icons.Beaker />, action: () => setActiveTab('patients') },
                                { label: 'Messages', icon: <Icons.Message />, action: () => setActiveTab('messages') }
                            ].map((act, i) => (
                                <button key={i} className="btn-quick-action" onClick={act.action} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px' }}>
                                    <div style={{ color: '#2E37A4' }}>{act.icon}</div>
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>{act.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Daily Timeline */}
                <div className="doc-card" style={{ height: 'fit-content', padding: '32px' }}>
                    <div className="doc-card-header" style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Clinical Timeline</h2>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#2E37A4', background: '#eff6ff', padding: '4px 10px', borderRadius: '4px' }}>UPCOMING</span>
                    </div>

                    <div className="timeline-list">
                        {today_schedule && today_schedule.length > 0 ? (
                            today_schedule.map((appt: any) => (
                                <div className="timeline-item" key={appt.id} style={{ paddingBottom: '32px' }}>
                                    <div className="timeline-line" style={{ background: '#f1f5f9', width: '2px' }}></div>
                                    <div className="timeline-icon" style={{
                                        width: '40px', height: '40px',
                                        background: appt.status === 'ongoing' ? '#ef4444' : '#f8fafc',
                                        color: appt.status === 'ongoing' ? 'white' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: appt.status === 'ongoing' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                                    }}>
                                        {appt.status === 'ongoing' ? <Icons.VideoSmall /> : <Icons.Clock />}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-time" style={{ fontSize: '11px', fontWeight: '800', color: appt.status === 'ongoing' ? '#ef4444' : '#94a3b8' }}>
                                            {appt.start_time.substring(0, 5)} {appt.status === 'ongoing' && <span style={{ marginLeft: '6px' }}>• ACTIVE</span>}
                                        </div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{appt.patient?.name || 'Private Patient'}</h4>
                                        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{appt.reason || 'General Follow-up'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '13px' }}>No activity logged for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
