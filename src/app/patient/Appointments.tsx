import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    Video: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Calendar: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    ChevronRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Loading: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" /></svg>,
};

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Appointment {
    id: number;
    doctor_id: number;
    doctor?: User;
    patient_id: number;
    patient?: User;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_status: 'unpaid' | 'paid';
    amount: number;
    type: 'video' | 'in-person';
    meeting_link?: string;
    reason?: string;
    iso_start_time: string;
}

interface AppointmentsProps {
    onRequestNewBooking?: () => void;
    onNavigateToMessages?: () => void;
    onRefresh?: () => void;
}

export default function Appointments({ onRequestNewBooking, onNavigateToMessages, onRefresh }: AppointmentsProps) {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();

        // Handle Paystack Verification Redirect
        const params = new URLSearchParams(window.location.search);
        const verifyRef = params.get('verify');
        if (verifyRef) {
            handleVerifyPayment(verifyRef);
        }
    }, []);

    const handleVerifyPayment = async (ref: string) => {
        const toastId = toast.loading('Verifying appointment payment...');
        try {
            await api.post('/payments/paystack/verify', { reference: ref });
            toast.success('Appointment Confirmed!', { id: toastId });

            // Remove verify param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('verify');
            window.history.replaceState({}, '', url.toString());

            if (onRefresh) onRefresh();
            fetchAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed', { id: toastId });
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await api.post(`/appointments/${id}/cancel`);
            toast.success('Appointment cancelled');
            fetchAppointments(); // Refresh
        } catch (error) {
            toast.error('Failed to cancel appointment');
        }
    };

    const handleStartChat = async (appointmentId: number) => {
        try {
            await api.post('/chats/start', { appointment_id: appointmentId });
            toast.success('Chat started');
            onNavigateToMessages?.();
        } catch (error) {
            toast.error('Failed to start chat');
        }
    };

    const handlePay = async (appointmentId: number) => {
        const toastId = toast.loading('Initializing payment...');
        try {
            // Use Paystack Initialization
            const { data } = await api.post('/payments/paystack/initialize', { appointment_id: appointmentId });

            // Redirect to Paystack
            window.location.href = data.authorization_url;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment initiation failed', { id: toastId });
        }
    };

    const handleJoinRoom = (link?: string) => {
        if (link) {
            window.open(link, '_blank');
        } else {
            toast.error("No meeting link available yet.");
        }
    };

    // Filter Logic
    const now = new Date();
    const upcomingAppointments = appointments.filter(appt =>
        !appt.status.startsWith('cancelled') &&
        appt.status !== 'completed' &&
        new Date(appt.iso_start_time) >= now
    );

    const pastAppointments = appointments.filter(appt =>
        appt.status === 'completed' ||
        (!appt.status.startsWith('cancelled') && new Date(appt.iso_start_time) < now)
    );

    const cancelledAppointments = appointments.filter(appt => appt.status.startsWith('cancelled'));

    const heroAppointment = upcomingAppointments[0];
    const otherUpcoming = upcomingAppointments.slice(1);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Appointments</h2>
                <button
                    onClick={() => onRequestNewBooking?.()}
                    style={{
                        background: '#2E37A4', color: 'white', padding: '12px 24px', borderRadius: '12px',
                        border: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.2)'
                    }}
                >
                    <Icons.Plus /> New Booking
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0' }}>
                {['Upcoming', 'Past', 'Cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            background: 'none', border: 'none', padding: '12px 4px',
                            fontSize: '15px', fontWeight: activeTab === tab.toLowerCase() ? '700' : '500',
                            color: activeTab === tab.toLowerCase() ? '#2E37A4' : '#64748b',
                            borderBottom: activeTab === tab.toLowerCase() ? '2px solid #2E37A4' : '2px solid transparent',
                            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Icons.Loading /></div>}

            {/* UPCOMING VIEW */}
            {!loading && activeTab === 'upcoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {upcomingAppointments.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No upcoming appointments.</div>
                    )}

                    {/* Active Appointment Hero Card */}
                    {heroAppointment && (
                        <div style={{
                            background: 'linear-gradient(90deg, #EEF2FF 0%, #F5F3FF 100%)',
                            borderRadius: '20px',
                            padding: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #e0e7ff',
                            position: 'relative',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                        }}>
                            <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                                <span style={{
                                    background: 'white', color: '#0f172a', padding: '6px 12px', borderRadius: '20px',
                                    fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0', textTransform: 'uppercase'
                                }}>{heroAppointment.status}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', width: '100%' }}>
                                {/* Left: Time & Date */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                                    <span style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
                                        {new Date(heroAppointment.iso_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Icons.Calendar /> {new Date(heroAppointment.iso_start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Middle: Doctor Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '40px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                        {heroAppointment.doctor?.name || 'Unknown Doctor'}
                                    </h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>General Practitioner</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E37A4', fontWeight: '600', fontSize: '13px', marginTop: '4px' }}>
                                        {heroAppointment.type === 'video' ? <><Icons.Video /> Virtual Consultation</> : <><Icons.MapPin /> In-Person Visit</>}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px' }}>
                                <button
                                    onClick={() => handleStartChat(heroAppointment.id)}
                                    style={{ background: 'transparent', border: '1px solid #2E37A4', color: '#2E37A4', padding: '11px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                                    Chat Doctor
                                </button>
                                <button
                                    onClick={() => handleCancel(heroAppointment.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                                    Cancel
                                </button>
                                {heroAppointment.payment_status === 'unpaid' && (
                                    <button
                                        onClick={() => handlePay(heroAppointment.id)}
                                        style={{ background: '#16a34a', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Pay Consultation Fee (₦{heroAppointment.amount.toLocaleString()})
                                    </button>
                                )}
                                {heroAppointment.payment_status === 'paid' && heroAppointment.type === 'video' && (
                                    <button
                                        onClick={() => handleJoinRoom(heroAppointment.meeting_link)}
                                        style={{ background: '#2E37A4', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Join Waiting Room
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Future List */}
                    {otherUpcoming.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Future Appointments</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {otherUpcoming.map(appt => (
                                    <div key={appt.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px',
                                        background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', background: appt.type === 'video' ? '#EEF2FF' : '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appt.type === 'video' ? '#2E37A4' : '#64748b', border: '1px solid #f1f5f9' }}>
                                                {appt.type === 'video' ? <Icons.Video /> : <Icons.MapPin />}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '700', fontSize: '16px' }}>{appt.doctor?.name}</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                                    {new Date(appt.iso_start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(appt.iso_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {appt.payment_status === 'unpaid' && (
                                                <button
                                                    onClick={() => handlePay(appt.id)}
                                                    style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                                >
                                                    Pay ₦{appt.amount.toLocaleString()}
                                                </button>
                                            )}
                                            {appt.payment_status === 'paid' && (
                                                <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>Paid</span>
                                            )}
                                            <button onClick={() => handleCancel(appt.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PAST VIEW */}
            {!loading && activeTab === 'past' && (
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pastAppointments.length === 0 && <div style={{ color: '#64748b' }}>No past appointments.</div>}
                        {pastAppointments.map((appt) => (
                            <div key={appt.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px',
                                background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', opacity: 0.8
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        {appt.type === 'video' ? <Icons.Video /> : <Icons.MapPin />}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '700', fontSize: '16px' }}>{appt.doctor?.name}</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                            {new Date(appt.iso_start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(appt.iso_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Completed</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CANCELLED VIEW */}
            {!loading && activeTab === 'cancelled' && (
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cancelledAppointments.length === 0 && <div style={{ color: '#64748b' }}>No cancelled appointments.</div>}
                        {cancelledAppointments.map((appt) => (
                            <div key={appt.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px',
                                background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', opacity: 0.7
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                        {appt.type === 'video' ? <Icons.Video /> : <Icons.MapPin />}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '700', fontSize: '16px', textDecoration: 'line-through' }}>{appt.doctor?.name}</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                            {new Date(appt.iso_start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(appt.iso_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Cancelled</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
