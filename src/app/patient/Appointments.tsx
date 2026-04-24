import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../services';
import WebRTCCall from '../../components/WebRTCCall';
import ConfirmationModal from '../../components/ConfirmationModal';

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
    doctor?: {
        specialty: string;
    };
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
    iso_start_time?: string;
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
    const [user, setUser] = useState<any>(null);
    const [showWebRTCCall, setShowWebRTCCall] = useState(false);
    const [activeCallAppointment, setActiveCallAppointment] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchUser();

        // Handle Paystack Verification Redirect
        const params = new URLSearchParams(window.location.search);
        const verifyRef = params.get('verify');
        if (verifyRef) {
            handleVerifyPayment(verifyRef);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/user');
            setUser(data);
        } catch (error) {
            console.error(error);
        }
    };

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
        setCancellingId(id);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (!cancellingId) return;
        try {
            await api.post(`/appointments/${cancellingId}/cancel`);
            toast.success('Appointment cancelled');
            fetchAppointments(); // Refresh
            setShowCancelModal(false);
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

    const handleJoinWaitRoom = (appt: any) => {
        setActiveCallAppointment(appt);
        setShowWebRTCCall(true);
    };

    // Filter Logic
    const now = new Date();
    const upcomingAppointments = appointments.filter(appt => {
        const status = appt.status.toLowerCase();
        if (status.includes('cancelled') || status === 'completed') return false;
        
        // If it's explicitly ongoing, it's upcoming
        if (status === 'ongoing') return true;

        const apptTime = new Date(appt.iso_start_time || (appt.appointment_date.split(' ')[0] + ' ' + appt.start_time));
        
        // Keep in upcoming if it's in the future OR it started within the last 4 hours (grace period)
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        return apptTime >= fourHoursAgo;
    });

    const pastAppointments = appointments.filter(appt => {
        const status = appt.status.toLowerCase();
        if (status === 'completed') return true;
        if (status.includes('cancelled')) return false;

        const apptTime = new Date(appt.iso_start_time || (appt.appointment_date.split(' ')[0] + ' ' + appt.start_time));
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        
        return apptTime < fourHoursAgo;
    });

    const cancelledAppointments = appointments.filter(appt => appt.status.includes('cancelled'));

    const heroAppointment = upcomingAppointments[0];
    const otherUpcoming = upcomingAppointments.slice(1);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', minHeight: '80vh' }}>
            {showWebRTCCall && activeCallAppointment && (
                <WebRTCCall
                    appointmentId={activeCallAppointment.id}
                    userId={user?.id}
                    userName={user?.name || 'Patient'}
                    receiverId={activeCallAppointment.doctor_id}
                    isDoctor={false}
                    onClose={() => {
                        setShowWebRTCCall(false);
                        setActiveCallAppointment(null);
                    }}
                />
            )}

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
                <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Appointments</h2>
                <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                    <button
                        onClick={() => onRequestNewBooking?.()}
                        style={{
                            background: '#2E37A4', color: 'white', padding: isMobile ? '14px 20px' : '12px 24px', borderRadius: '12px',
                            border: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(46, 55, 164, 0.2)', flex: isMobile ? 1 : 'unset', justifyContent: 'center'
                        }}
                    >
                        <Icons.Plus /> New Booking
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: isMobile ? '20px' : '32px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                {['Upcoming', 'Past', 'Cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            background: 'none', border: 'none', padding: '12px 0',
                            fontSize: isMobile ? '14px' : '15px', fontWeight: activeTab === tab.toLowerCase() ? '800' : '600',
                            color: activeTab === tab.toLowerCase() ? '#2E37A4' : '#94a3b8',
                            borderBottom: activeTab === tab.toLowerCase() ? '3px solid #2E37A4' : '3px solid transparent',
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
                            background: 'white',
                            borderRadius: '24px',
                            padding: isMobile ? '24px' : '32px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #e2e8f0',
                            position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            overflow: 'hidden'
                        }}>
                             {/* Accented Indicator */}
                             <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#2E37A4' }}></div>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '24px' : '40px', width: '100%' }}>
                                {/* Left: Time & Date */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', lineHeight: '1' }}>
                                        {heroAppointment.start_time.substring(0, 5)}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#2E37A4', background: '#eef2ff', padding: '4px 10px', borderRadius: '8px', marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                        <Icons.Calendar /> {new Date(heroAppointment.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* Middle: Doctor Info */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '6px', 
                                    borderLeft: isMobile ? 'none' : '1px solid #f1f5f9', 
                                    paddingLeft: isMobile ? '0' : '40px' 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                            Dr. {heroAppointment.doctor?.name || 'Specialist'}
                                        </h3>
                                        <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>Active</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{heroAppointment.doctor?.doctor?.specialty || 'General Practitioner'}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E37A4', fontWeight: '700', fontSize: '12px', marginTop: '6px' }}>
                                        {heroAppointment.type === 'video' ? <><Icons.Video /> VIRTUAL MEETING</> : <><Icons.MapPin /> IN-PERSON VISIT</>}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row', 
                                alignItems: 'center', 
                                gap: '12px', 
                                marginTop: isMobile ? '24px' : '0',
                                width: isMobile ? '100%' : 'auto' 
                            }}>
                                {(() => {
                                    const apptTime = heroAppointment.iso_start_time ? new Date(heroAppointment.iso_start_time) : new Date(heroAppointment.appointment_date + 'T' + heroAppointment.start_time);
                                    const isTooEarly = new Date().getTime() < (apptTime.getTime() - (15 * 60 * 1000));
                                    const status = heroAppointment.status as any;
                                    return (
                                        <>
                                            {heroAppointment.payment_status === 'unpaid' && (
                                                <button
                                                    onClick={() => handlePay(heroAppointment.id)}
                                                    style={{ background: '#16a34a', color: 'white', padding: '14px 24px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: '14px' }}>
                                                    Pay ₦{heroAppointment.amount.toLocaleString()}
                                                </button>
                                            )}
                                            {heroAppointment.payment_status === 'paid' && (status === 'confirmed' || status === 'ongoing') && (
                                                <button
                                                    onClick={() => handleJoinWaitRoom(heroAppointment)}
                                                    disabled={isTooEarly && status !== 'ongoing'}
                                                    style={{ 
                                                        background: isMobile ? '#2E37A4' : (isTooEarly && status !== 'ongoing' ? '#94a3b8' : '#2E37A4'), 
                                                        color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', 
                                                        fontWeight: '700', cursor: (isTooEarly && status !== 'ongoing') ? 'not-allowed' : 'pointer', width: isMobile ? '100%' : 'auto', fontSize: '15px' 
                                                    }}
                                                >
                                                    {status === 'ongoing' ? 'Join Session' : (isTooEarly ? `Starts at ${heroAppointment.start_time.substring(0, 5)}` : 'Join Waiting Room')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStartChat(heroAppointment.id)}
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: '1px solid #e2e8f0', 
                                                    color: '#64748b', 
                                                    padding: '14px 24px', borderRadius: '12px', fontWeight: '700', 
                                                    cursor: 'pointer', fontSize: '14px', width: isMobile ? '100%' : 'auto'
                                                }}
                                            >
                                                Chat
                                            </button>
                                            <button
                                                onClick={() => handleCancel(heroAppointment.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '13px', width: isMobile ? '100%' : 'auto' }}>
                                                Cancel
                                            </button>
                                        </>
                                    );
                                })()}
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
                                        display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', padding: isMobile ? '16px' : '20px 24px',
                                        background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', gap: isMobile ? '16px' : '0'
                                    }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '44px', height: '44px', background: appt.type === 'video' ? '#EEF2FF' : '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appt.type === 'video' ? '#2E37A4' : '#64748b', flexShrink: 0 }}>
                                                {appt.type === 'video' ? <Icons.Video /> : <Icons.MapPin />}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 2px 0', color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{appt.doctor?.name}</h4>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {appt.start_time.substring(0, 5)}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                                            {appt.payment_status === 'unpaid' && (
                                                <button
                                                    onClick={() => handlePay(appt.id)}
                                                    style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {(() => {
                                                if (appt.payment_status === 'paid') {
                                                    const apptTime = appt.iso_start_time ? new Date(appt.iso_start_time) : new Date(appt.appointment_date + 'T' + appt.start_time);
                                                    const isTooEarly = new Date().getTime() < (apptTime.getTime() - (15 * 60 * 1000));
                                                    return (
                                                        <button
                                                            onClick={() => handleJoinWaitRoom(appt)}
                                                            disabled={isTooEarly && (appt.status as string) !== 'ongoing'}
                                                            style={{ background: (isTooEarly && (appt.status as string) !== 'ongoing') ? '#94a3b8' : '#2E37A4', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: (isTooEarly && (appt.status as string) !== 'ongoing') ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '11px' }}
                                                        >
                                                            Start Consultation
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {appt.payment_status === 'paid' ? (
                                                <button onClick={() => toast.success("Redirecting to reschedule tab...")} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Reschedule</button>
                                            ) : (
                                                <button onClick={() => handleCancel(appt.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Cancel</button>
                                            )}
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
                        {pastAppointments.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No past appointments.</div>}
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
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {appt.start_time.substring(0, 5)}</p>
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
                        {cancelledAppointments.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No cancelled appointments.</div>}
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
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {appt.start_time.substring(0, 5)}</p>
                                    </div>
                                </div>
                                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Cancelled</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmationModal
                show={showCancelModal}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                type="danger"
                onConfirm={confirmCancel}
                onCancel={() => setShowCancelModal(false)}
                confirmText="Yes, Cancel"
            />
        </div>
    );
}
