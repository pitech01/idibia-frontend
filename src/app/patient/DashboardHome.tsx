import { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { api } from '../../services';

// Icons for specific dashboard widgets
const WidgetIcons = {
    Book: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Medicine: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Lab: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Phone: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Heart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Scale: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
    Drop: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Document: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    ChevronRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Calendar: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Wallet: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    ArrowUpRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" /></svg>,
    ArrowDownLeft: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17V7M7 17H17" /></svg>
};


interface DashboardHomeProps {
    onNavigate: (tab: string) => void;
    user?: any;
    loading: boolean;
}

export default function DashboardHome({ onNavigate, user, loading }: DashboardHomeProps) {
    const [balanceVisible, setBalanceVisible] = useState(false);
    const [comingSoonOpen, setComingSoonOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/patient/dashboard');
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setDataLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const [greetingData] = useState(() => {
        const hour = parseInt(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }));
        if (hour < 12) return { text: 'Good Morning', icon: '☀️' };
        if (hour < 17) return { text: 'Good Afternoon', icon: '🌤️' };
        return { text: 'Good Evening', icon: '🌙' };
    });


    const handleQuickAction = (actionLabel: string) => {
        switch (actionLabel) {
            case 'Book Doctor':
                onNavigate('new-booking');
                break;
            case 'Buy Medicine':
                setComingSoonOpen(true);
                break;
            case 'Lab Tests':
                onNavigate('records');
                break;
            case 'Emergency':
                window.location.href = 'tel:070000000000';
                break;
            default:
                break;
        }
    };

    const upcoming = dashboardData?.upcoming_appointment;
    const wallet = dashboardData?.wallet_balance;
    const activity = dashboardData?.recent_activity || [];
    const vitals = dashboardData?.vitals || [];

    // Helper for formatting currency
    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const rawName = user?.name?.split(' ')[0] || 'User';
    const displayName = isMobile && rawName.length > 8 ? rawName.substring(0, 8) + '...' : rawName;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Greeting Banner */}
            <div className="patient-banner animate-fade-in">
                <div className="banner-content">
                    <span className="greeting-pill">{greetingData.icon} {greetingData.text}</span>
                    <h1 className="greeting-title">
                        {loading ? <Skeleton width={200} /> : (
                            <>Welcome back, <span className="name-highlight">{displayName}</span></>
                        )}
                    </h1>
                    <p className="greeting-subtitle">Your health journey is our priority. How can we help you today?</p>
                </div>
                <div className="banner-illustration desktop-only">
                    <img src="/dashboard-illustration.png" alt="Health Dashboard" />
                </div>
            </div>

            {/* Simplified Quick Actions */}
            <div className="patient-quick-actions">
                {[
                    { label: 'Book Doctor', icon: <WidgetIcons.Book />, color: '#2E37A4', bg: '#eef2ff' },
                    { label: 'Buy Medicine', icon: <WidgetIcons.Medicine />, color: '#10b981', bg: '#dcfce7' },
                    { label: 'Lab Tests', icon: <WidgetIcons.Lab />, color: '#8b5cf6', bg: '#f3e8ff' },
                    { label: 'Emergency', icon: <WidgetIcons.Phone />, color: '#dc2626', bg: '#fee2e2' },
                ].map((action, idx) => (
                    <div
                        key={idx}
                        className="patient-action-card animate-slide-up"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        onClick={() => handleQuickAction(action.label)}
                    >
                        <div className="action-icon-box" style={{ background: action.bg, color: action.color }}>
                            {action.icon}
                        </div>
                        <span className="action-label">{action.label}</span>
                        <div className="action-arrow"><WidgetIcons.ChevronRight /></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Row 1: Appointment & Wallet */}
                <div className="dashboard-main-grid">
                    {/* Upcoming Appointment */}
                    <div className="dash-card">
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 className="card-title" style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Upcoming Appointment</h3>
                                {dataLoading ? <Skeleton width={80} /> : (
                                    upcoming ? <span className="status-badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>Confirmed</span> :
                                        <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>None</span>
                                )}
                            </div>

                            {dataLoading ? <Skeleton height={150} /> : (
                                upcoming ? (
                                    <div style={{ background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E37A4', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                <WidgetIcons.Book />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e2894' }}>{upcoming.doctor?.name || 'Doctor'}</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{upcoming.doctor?.specialty || 'Medical Doctor'}</p>
                                            </div>
                                        </div>
                                        <div style={{ height: '1px', background: 'rgba(59, 130, 246, 0.15)', marginBottom: '24px' }}></div>
                                        <div className="appointment-date-time-row">
                                            <span><WidgetIcons.Book /> {upcoming.start_time.substring(0, 5)}</span>
                                            <span><WidgetIcons.Calendar /> {new Date(upcoming.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                        <p>No upcoming appointments</p>
                                        <button onClick={() => onNavigate('new-booking')} className="btn-secondary-light" style={{ marginTop: '10px' }}>Book Now</button>
                                    </div>
                                )
                            )}
                        </div>

                        {upcoming && upcoming.type === 'video' && (
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {(() => {
                                    const apptTime = upcoming.iso_start_time ? new Date(upcoming.iso_start_time) : new Date(upcoming.appointment_date + 'T' + upcoming.start_time);
                                    const isTooEarly = new Date().getTime() < (apptTime.getTime() - (15 * 60 * 1000));
                                    return (
                                        <button 
                                            onClick={() => !isTooEarly && onNavigate('appointments')} 
                                            className="btn-primary-dark" 
                                            disabled={isTooEarly}
                                            style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', cursor: isTooEarly ? 'not-allowed' : 'pointer', border: 'none', opacity: isTooEarly ? 0.5 : 1 }}
                                        >
                                            <WidgetIcons.Video /> Start Consultation
                                        </button>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Wallet */}
                    <div className="dash-card">
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Wallet Balance</h3>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <WidgetIcons.Wallet />
                                </div>
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h2 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                                        {dataLoading ? <Skeleton width={150} /> : (balanceVisible ? formatCurrency(wallet) : '₦****')}
                                    </h2>
                                    <button
                                        onClick={() => setBalanceVisible(!balanceVisible)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}
                                    >
                                        {balanceVisible ? <WidgetIcons.EyeOff /> : <WidgetIcons.Eye />}
                                    </button>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Available balance</p>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('payment')} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#2E37A4', border: '1px solid #2E37A4', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            + Top Up
                        </button>
                    </div>
                </div>

                {/* Row 2: Recent Activity & Vitals */}
                <div className="dashboard-main-grid">
                    {/* Recent Activity */}
                    <div className="dash-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="card-title" style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Recent Activity</h3>
                            <button 
                                onClick={() => onNavigate('appointments')} 
                                style={{ background: 'none', border: 'none', fontSize: '14px', color: '#2E37A4', fontWeight: '600', cursor: 'pointer' }}
                            >
                                View all
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {dataLoading ? <Skeleton count={3} height={60} /> : (
                                activity.length > 0 ? activity.map((item: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '16px',
                                        border: '1px solid #f8fafc'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.type === 'appointment' ? <WidgetIcons.Calendar /> : <WidgetIcons.Wallet />}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>{item.title}</h4>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{item.subtitle}</p>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className={`status-badge ${item.status === 'confirmed' || item.status === 'success' ? 'status-confirmed' : 'status-pending'}`}>{item.status}</span>
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#64748b' }}>No recent activity.</p>
                            )}
                        </div>
                    </div>

                    {/* Latest Vitals */}
                    <div className="dash-card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 className="card-title" style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Latest Vitals</h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Recent</span>
                            </div>
                            {dataLoading ? <Skeleton count={3} height={50} /> : (
                                vitals.length > 0 ? vitals.map((vital: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eef2ff', color: '#2E37A4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <WidgetIcons.Heart />
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>{vital.type}</span>
                                                <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{vital.value} <small style={{ color: '#94a3b8', fontWeight: '500', fontSize: '12px' }}>{vital.unit}</small></span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: vital.status === 'High' ? '#dc2626' : '#16a34a' }}>
                                            {vital.status}
                                        </span>
                                    </div>
                                )) : <p style={{ color: '#64748b' }}>No records yet.</p>
                            )}
                        </div>
                        <button onClick={() => onNavigate('records')} style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', color: '#2E37A4', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Update Vitals</button>
                    </div>
                </div>
            </div>

            {/* Coming Soon Modal */}
            {comingSoonOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setComingSoonOpen(false)}>
                    <div className="animate-fade-in" style={{
                        background: 'white', borderRadius: '24px', padding: '40px',
                        width: '400px', maxWidth: '90%', textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
                        }}>
                            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Coming Soon</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
                            We are currently building the Medicine Store module to serve you better. Check back soon!
                        </p>
                        <button
                            onClick={() => setComingSoonOpen(false)}
                            style={{
                                width: '100%', padding: '14px', background: '#2E37A4', color: 'white', borderRadius: '12px',
                                border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer'
                            }}
                        >
                            Okay, Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
