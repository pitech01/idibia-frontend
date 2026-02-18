import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Star: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
    Verified: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Loading: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" /></svg>,
};

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    doctor?: {
        id: number;
        specialty: string;
        consultation_fee: number;
        bio: string;
    }
}

interface NewBookingProps {
    onBack: () => void;
    onRefresh?: () => void;
    user?: any;
}

export default function NewBooking({ onBack, onRefresh, user }: NewBookingProps) {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Modal & Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');
    const [useWalletForHybrid, setUseWalletForHybrid] = useState(true);
    const [createdAppointment, setCreatedAppointment] = useState<any>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Selection State
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [consultationType, setConsultationType] = useState('video');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/doctors');
            setDoctors(data);
        } catch (error) {
            console.error("Fetch Doctors Error:", error);
            toast.error("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDoctor = (doctor: User) => {
        setSelectedDoctor(doctor);
        setStep(2);
    };

    const handleBackStep = () => {
        if (step > 1) setStep(step - 1);
        else onBack();
    };

    const initiateBooking = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) {
            toast.error("Please fill all details");
            return;
        }

        console.log("Initiating booking for doctor:", selectedDoctor.id);
        setBookingLoading(true);
        const toastId = toast.loading('Creating appointment...');

        try {
            // 1. Create Pending Appointment
            const { data } = await api.post('/appointments', {
                doctor_id: selectedDoctor.id,
                appointment_date: selectedDate,
                start_time: selectedTime,
                type: consultationType,
                reason: reason
            });

            console.log("Appointment created successfully:", data.appointment.id);
            setCreatedAppointment(data.appointment);
            setBookingLoading(false);
            toast.success('Appointment Reserved!', { id: toastId });

            // Open Payment Modal
            setShowPaymentModal(true);
        } catch (error: any) {
            console.error("Booking Error:", error);
            const msg = error.response?.data?.message || 'Failed to reserve appointment';
            toast.error(msg, { id: toastId });
            setBookingLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!createdAppointment) return;

        console.log(`Processing payment via ${paymentMethod} for appointment ${createdAppointment.id}`);
        setPaymentProcessing(true);
        const toastId = toast.loading('Processing payment...');

        try {
            if (paymentMethod === 'wallet') {
                // WALLET FLOW
                const response = await api.post('/payments/pay-appointment', {
                    appointment_id: createdAppointment.id
                });

                console.log("Wallet payment successful:", response.data);
                toast.success('Payment Successful! Appointment Confirmed.', { id: toastId });

                // Refresh dashboard and exit
                if (onRefresh) onRefresh();
                setTimeout(() => onBack(), 1500);
            } else {
                // PAYSTACK FLOW
                console.log("Initializing Paystack... Hybrid:", useWalletForHybrid);
                const { data: paystackData } = await api.post('/payments/paystack/initialize', {
                    appointment_id: createdAppointment.id,
                    use_wallet: useWalletForHybrid
                });

                if (paystackData.authorization_url) {
                    console.log("Redirecting to Paystack:", paystackData.authorization_url);
                    toast.loading('Redirecting to secure payment...', { id: toastId });
                    window.location.href = paystackData.authorization_url;
                } else {
                    throw new Error("Invalid Paystack response");
                }
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            const msg = error.response?.data?.message || 'Payment processing failed';
            toast.error(msg, { id: toastId });
            setPaymentProcessing(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Generate next 7 days dates
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                label: i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                value: date.toISOString().split('T')[0]
            });
        }
        return dates;
    };

    const dateOptions = generateDates();
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [consultationDuration, setConsultationDuration] = useState<number>(30); // Default to 30 mins
    const [hasFetchedSlots, setHasFetchedSlots] = useState(false);

    useEffect(() => {
        let interval: any;
        if (selectedDoctor && selectedDate) {
            fetchSlots();
            // Poll for slots every 30 seconds to keep availability fresh
            interval = setInterval(fetchSlots, 30000);
        } else {
            setTimeSlots([]);
            setHasFetchedSlots(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedDoctor, selectedDate]);

    const fetchSlots = async () => {
        setSelectedTime('');
        setHasFetchedSlots(false);
        try {
            const { data } = await api.get(`/doctors/${selectedDoctor?.id}/slots?date=${selectedDate}`);
            setTimeSlots(data.slots || []);
            // Update duration if provided by backend, else keep default/previous
            if (data.duration) {
                setConsultationDuration(data.duration);
            }
        } catch (error) {
            console.error("Fetch Slots Error:", error);
            toast.error("Failed to load available slots");
            setTimeSlots([]);
        } finally {
            setHasFetchedSlots(true);
        }
    };

    // Format Slot Time (UTC -> Local Display)
    const formatSlotTime = (time: string) => {
        if (!time) return '';
        // Append dummy date and Z to treat it as UTC time
        const date = new Date(`2000-01-01T${time}:00Z`);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Calculate End Time (UTC Start -> Add Duration -> Local Display)
    const getEndTime = (startTime: string) => {
        if (!startTime) return '';
        const date = new Date(`2000-01-01T${startTime}:00Z`);
        date.setMinutes(date.getMinutes() + consultationDuration);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Wallet & Fee Calculation (Explicitly as Numbers)
    const walletBalance = Number(user?.patient?.wallet_balance || 0);
    const fee = Number(selectedDoctor?.doctor?.consultation_fee || 0);
    const isWalletSufficient = walletBalance >= fee;

    // Scroll Lock when modal is open
    useEffect(() => {
        if (showPaymentModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPaymentModal]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Icons.ArrowLeft />
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {step === 1 ? "Select Specialist" : "Booking Details"}
                </h2>
            </div>

            {/* Content Card */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>

                {/* Progress Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: step >= i ? '#2E37A4' : '#e2e8f0',
                                    color: step >= i ? 'white' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', fontSize: '14px'
                                }}>{i}</div>
                                {i < 2 && <div style={{ width: '40px', height: '2px', background: step > i ? '#2E37A4' : '#e2e8f0' }}></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                    {loading && <div style={{ display: 'flex', justifyContent: 'center' }}><Icons.Loading /></div>}

                    {/* STEP 1: Select Doctor */}
                    {!loading && step === 1 && (
                        <>
                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }}><Icons.Search /></span>
                                <input
                                    type="text"
                                    placeholder="Search specialists by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        outline: 'none', fontSize: '15px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {filteredDoctors.length === 0 && <p>No records found.</p>}
                                {filteredDoctors.map(doctor => (
                                    <div key={doctor.id} style={{
                                        border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px',
                                        display: 'flex', gap: '20px', transition: 'all 0.2s', background: 'white',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer'
                                    }} onClick={() => handleSelectDoctor(doctor)}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '16px', background: '#EEF2FF',
                                            color: '#2E37A4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '20px', fontWeight: '700', flexShrink: 0
                                        }}>
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dr. {doctor.name}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{doctor.doctor?.specialty || "Specialist"}</p>
                                            <div style={{ color: '#2E37A4', fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>
                                                ₦{doctor.doctor?.consultation_fee?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* STEP 2: Select Date & Time */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', color: '#2E37A4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{selectedDoctor?.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Dr. {selectedDoctor?.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        {selectedDoctor?.doctor?.specialty} • ₦{selectedDoctor?.doctor?.consultation_fee?.toLocaleString()} • {consultationDuration} min session
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>1. Pick a Date</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                                {dateOptions.map((date) => (
                                    <button
                                        key={date.value}
                                        onClick={() => setSelectedDate(date.value)}
                                        style={{
                                            padding: '12px', borderRadius: '10px',
                                            border: selectedDate === date.value ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: selectedDate === date.value ? '#f0f4ff' : 'white',
                                            color: selectedDate === date.value ? '#2E37A4' : '#64748b',
                                            fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                                        }}
                                    >
                                        {date.label}
                                    </button>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>2. Available Time Slots</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        style={{
                                            padding: '12px', borderRadius: '10px',
                                            border: selectedTime === slot ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: selectedTime === slot ? '#f0f4ff' : 'white',
                                            color: selectedTime === slot ? '#2E37A4' : '#0f172a',
                                            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                                        }}
                                    >
                                        <span>{formatSlotTime(slot)}</span>
                                        {selectedTime === slot && (
                                            <span style={{ fontSize: '10px', fontWeight: '500', opacity: 0.8 }}>Ends {getEndTime(slot)}</span>
                                        )}
                                    </button>
                                ))}
                                {timeSlots.length === 0 && !hasFetchedSlots && <p style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: '14px' }}>Please select a date to see slots.</p>}
                                {timeSlots.length === 0 && hasFetchedSlots && <p style={{ gridColumn: '1 / -1', color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>No available slots for this date.</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Consultation Type</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => setConsultationType('video')}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: consultationType === 'video' ? '2px solid #2E37A4' : '1px solid #e2e8f0', background: consultationType === 'video' ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                        >Video Call</button>
                                        <button
                                            onClick={() => setConsultationType('in-person')}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: consultationType === 'in-person' ? '2px solid #2E37A4' : '1px solid #e2e8f0', background: consultationType === 'in-person' ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                        >In-Person</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Reason (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Brief reason for visit"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={handleBackStep} disabled={bookingLoading} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        onClick={step === 1 ? () => setStep(2) : initiateBooking}
                        disabled={bookingLoading || (step === 2 && (!selectedDate || !selectedTime))}
                        style={{
                            padding: '14px 32px', background: '#2E37A4', color: 'white', borderRadius: '12px',
                            border: 'none', fontWeight: '700', cursor: 'pointer', opacity: bookingLoading ? 0.7 : 1
                        }}
                    >
                        {bookingLoading ? 'One moment...' : (step === 1 ? 'Next Step' : 'Book Appointment')}
                    </button>
                </div>
            </div>

            {/* PAYMENT MODAL OVERLAY - Rendered via Portal to escape stacking contexts */}
            {showPaymentModal && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000
                }}>
                    <div className="animate-fade-in" style={{
                        background: 'white', width: '100%', maxWidth: '480px', borderRadius: '32px',
                        padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', margin: '0 auto 16px' }}>
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Choose Payment Method</h2>
                            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>Finalize your booking with Dr. {selectedDoctor?.name}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {/* Wallet Option */}
                            <button
                                disabled={paymentProcessing}
                                onClick={() => setPaymentMethod('wallet')}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '20px', borderRadius: '16px', border: paymentMethod === 'wallet' ? '2.5px solid #2E37A4' : '1px solid #e2e8f0',
                                    background: paymentMethod === 'wallet' ? '#f8faff' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>Pay From Wallet</div>
                                    <div style={{ fontSize: '13px', color: isWalletSufficient ? '#16a34a' : '#ef4444', fontWeight: '600' }}>
                                        Balance: ₦{walletBalance.toLocaleString()} {isWalletSufficient ? "(Sufficient)" : "(Insufficient)"}
                                    </div>
                                </div>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #2E37A4', background: paymentMethod === 'wallet' ? '#2E37A4' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {paymentMethod === 'wallet' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>}
                                </div>
                            </button>

                            {/* Paystack Option */}
                            <button
                                disabled={paymentProcessing}
                                onClick={() => setPaymentMethod('paystack')}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    padding: '20px', borderRadius: '16px', border: paymentMethod === 'paystack' ? '2.5px solid #2E37A4' : '1px solid #e2e8f0',
                                    background: paymentMethod === 'paystack' ? '#f8faff' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>Pay With Paystack</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>Cards, Bank, USSD</div>
                                    </div>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #2E37A4', background: paymentMethod === 'paystack' ? '#2E37A4' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'paystack' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>}
                                    </div>
                                </div>

                                {paymentMethod === 'paystack' && walletBalance > 0 && !isWalletSufficient && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '10px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={useWalletForHybrid} onChange={e => setUseWalletForHybrid(e.target.checked)} />
                                        <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '500' }}>Use wallet balance (₦{walletBalance.toLocaleString()}) first</span>
                                    </label>
                                )}
                            </button>
                        </div>

                        {/* Price Breakdown */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Consultation Fee</span>
                                <span style={{ color: '#0f172a', fontWeight: '600' }}>₦{fee.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Wallet Balance</span>
                                <span style={{ color: '#0f172a', fontWeight: '600' }}>₦{walletBalance.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f8fafc', paddingTop: '16px', marginTop: '16px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Amount to be paid</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#2E37A4' }}>
                                    ₦{(paymentMethod === 'wallet' ? fee : (useWalletForHybrid ? Math.max(0, fee - walletBalance) : fee)).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={paymentProcessing}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                            >Cancel</button>
                            <button
                                onClick={handlePayment}
                                disabled={paymentProcessing || (paymentMethod === 'wallet' && !isWalletSufficient)}
                                style={{
                                    flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: '#2E37A4', color: 'white', fontWeight: '700', cursor: 'pointer',
                                    opacity: (paymentProcessing || (paymentMethod === 'wallet' && !isWalletSufficient)) ? 0.6 : 1
                                }}
                            >
                                {paymentProcessing ? "Processing..." : "Complete Payment"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
