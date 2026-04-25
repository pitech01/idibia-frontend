import { useState, useEffect } from 'react';
import { toast as _toast } from 'react-hot-toast';
const toast: any = _toast;
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

const Stepper = ({ currentStep, isMobile }: { currentStep: number, isMobile: boolean }) => {
    const steps = [
        { id: 1, label: 'Specialist' },
        { id: 2, label: 'Availability' },
        { id: 3, label: 'Payment' }
    ];
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '12px' : '40px',
            marginBottom: isMobile ? '32px' : '48px',
            padding: isMobile ? '0 10px' : '0'
        }}>
            {steps.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
                    <div style={{
                        width: isMobile ? '32px' : '40px',
                        height: isMobile ? '32px' : '40px',
                        borderRadius: '12px',
                        background: currentStep >= s.id ? '#2E37A4' : '#f1f5f9',
                        color: currentStep >= s.id ? 'white' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: isMobile ? '13px' : '15px', transition: '0.3s',
                        boxShadow: currentStep === s.id ? '0 10px 15px -3px rgba(46, 55, 164, 0.3)' : 'none',
                        flexShrink: 0
                    }}>{s.id}</div>
                    {!isMobile && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step {s.id}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: currentStep >= s.id ? '#0f172a' : '#cbd5e1', whiteSpace: 'nowrap' }}>{s.label}</span>
                        </div>
                    )}
                    {i < steps.length - 1 && (
                        <div style={{
                            width: isMobile ? '20px' : '40px',
                            height: '2px',
                            background: currentStep > s.id ? '#2E37A4' : '#f1f5f9',
                            marginLeft: isMobile ? '5px' : '10px'
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default function NewBooking({ onBack, onRefresh, user }: NewBookingProps) {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Modal & Payment State
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');
    const useWalletForHybrid = true; // Default to true for standard flow
    const [createdAppointment, setCreatedAppointment] = useState<any>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Selection State
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [consultationType, setConsultationType] = useState('video');
    const [reason, setReason] = useState('');
    const [viewMonth, setViewMonth] = useState(new Date());

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

        setBookingLoading(true);
        const toastId = toast.loading('Reserving your session...');

        try {
            const { data } = await api.post('/appointments', {
                doctor_id: selectedDoctor.id,
                appointment_date: selectedDate,
                start_time: selectedTime,
                type: consultationType,
                reason: reason
            });

            setCreatedAppointment(data.appointment);
            setBookingLoading(false);
            toast.success('Session reserved!', { id: toastId });
            setStep(3); // Move to Payment Step
        } catch (error: any) {
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
                const { data: paystackData } = await api.post('/payments/paystack/initialize', {
                    appointment_id: createdAppointment.id,
                    use_wallet: useWalletForHybrid
                });

                // Use Paystack Inline instead of Redirect
                const handler = (window as any).PaystackPop.setup({
                    key: paystackData.public_key,
                    email: user?.email,
                    amount: (paystackData.amount || (useWalletForHybrid ? Math.max(50, fee - walletBalance) : fee)) * 100,
                    ref: paystackData.reference,
                    onClose: () => {
                        setPaymentProcessing(false);
                        toast("Payment window closed");
                    },
                    callback: (response: any) => {
                        console.log("Appointment Payment Response:", response);
                        // Trigger verification on backend
                        api.post('/payments/paystack/verify', { reference: response.reference })
                            .then(() => {
                                toast.success('Payment Successful! Appointment Confirmed.', { id: toastId });
                                if (onRefresh) onRefresh();
                                setTimeout(() => onBack(), 1500);
                            })
                            .catch(err => {
                                console.error("Verification error:", err);
                                toast.error("Verification failed. Please contact support.", { id: toastId });
                                setPaymentProcessing(false);
                            });
                    }
                });
                handler.openIframe();
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            const msg = error.response?.data?.message || 'Payment processing failed';
            toast.error(msg, { id: toastId });
            setPaymentProcessing(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));


    const [timeSlots, setTimeSlots] = useState<string[]>([]);
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
        } catch (error: any) {
            console.error("Fetch Slots Error:", error);
            const message = error.response?.data?.message || "Failed to load available slots";
            toast.error(message);
            setTimeSlots([]);
        } finally {
            setHasFetchedSlots(true);
        }
    };

    // Wallet & Fee Calculation (Explicitly as Numbers)
    const walletBalance = Number(user?.patient?.wallet_balance || 0);
    const fee = Number(selectedDoctor?.doctor?.consultation_fee || 0);
    const isWalletSufficient = walletBalance >= fee;

    // Step navigation effect
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

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

            {/* Enhanced Content Card */}
            <div style={{
                background: 'white',
                border: isMobile ? 'none' : '1px solid #e2e8f0',
                borderRadius: isMobile ? '0' : '32px',
                padding: isMobile ? '24px 16px' : '48px',
                minHeight: isMobile ? 'calc(100vh - 100px)' : '700px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isMobile ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>

                <Stepper currentStep={step} isMobile={isMobile} />

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

                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '300px'}, 1fr))`, gap: isMobile ? '12px' : '20px' }}>
                                {filteredDoctors.length === 0 && <p>No records found.</p>}
                                {filteredDoctors.map(doctor => (
                                    <div key={doctor.id} style={{
                                        border: selectedDoctor?.id === doctor.id ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                        borderRadius: '16px',
                                        padding: isMobile ? '16px' : '24px',
                                        display: 'flex',
                                        gap: isMobile ? '12px' : '20px',
                                        transition: 'all 0.2s',
                                        background: selectedDoctor?.id === doctor.id ? '#f0f4ff' : 'white',
                                        boxShadow: selectedDoctor?.id === doctor.id ? '0 4px 12px rgba(46, 55, 164, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        alignItems: 'center'
                                    }} onClick={() => handleSelectDoctor(doctor)}>
                                        <div style={{
                                            width: isMobile ? '52px' : '64px',
                                            height: isMobile ? '52px' : '64px',
                                            borderRadius: '14px',
                                            background: '#EEF2FF',
                                            color: '#2E37A4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: isMobile ? '18px' : '20px',
                                            fontWeight: '700',
                                            flexShrink: 0
                                        }}>
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dr. {doctor.name}</h3>
                                            <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#64748b', margin: '2px 0' }}>{doctor.doctor?.specialty || "Specialist"}</p>
                                            <div style={{ color: '#2E37A4', fontWeight: '700', fontSize: isMobile ? '13px' : '14px', marginTop: '4px' }}>
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
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedDoctor?.doctor?.specialty} • ₦{selectedDoctor?.doctor?.consultation_fee?.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Classic Calendar UI */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>1. Select Appointment Date</h3>
                                
                                <div style={{ 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '24px', 
                                    overflow: 'hidden', 
                                    background: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                                }}>
                                    {/* Calendar Header */}
                                    {(() => {
                                        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                        
                                        const firstDayOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
                                        const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
                                        
                                        const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
                                        const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
                                        
                                        const days: any[] = [];
                                        const today = new Date();
                                        today.setHours(0,0,0,0);

                                        // Blank spaces for first week
                                        for (let i = 0; i < firstDayOfMonth; i++) {
                                            days.push(<div key={`blank-${i}`} style={{ height: '48px' }}></div>);
                                        }

                                        // Month days
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const dateObj = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
                                            const dateVal = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
                                            const isPast = dateObj < today;
                                            const isSelected = selectedDate === dateVal;

                                            days.push(
                                                <div 
                                                    key={d} 
                                                    onClick={() => !isPast && setSelectedDate(dateVal)}
                                                    style={{ 
                                                        height: isMobile ? '40px' : '48px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        borderRadius: '12px',
                                                        cursor: isPast ? 'default' : 'pointer',
                                                        background: isSelected ? '#2E37A4' : 'transparent',
                                                        color: isSelected ? 'white' : (isPast ? '#cbd5e1' : '#0f172a'),
                                                        fontWeight: isSelected || dateObj.getTime() === today.getTime() ? '700' : '500',
                                                        transition: 'all 0.2s',
                                                        border: dateObj.getTime() === today.getTime() && !isSelected ? '1.5px solid #2E37A4' : 'none',
                                                        fontSize: isMobile ? '13px' : '14px'
                                                    }}
                                                    className={!isPast && !isSelected ? "calendar-day-hover" : ""}
                                                >
                                                    {d}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div style={{ padding: isMobile ? '12px' : '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '16px' : '24px' }}>
                                                    <h4 style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', fontWeight: '800', color: '#1e293b' }}>
                                                        {months[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={prevMonth} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                                        </button>
                                                        <button onClick={nextMonth} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '12px' }}>
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                        <div key={d} style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                                    {days}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>2. Available Time Slots</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '80px' : '100px'}, 1fr))`, gap: '12px', marginBottom: '32px' }}>
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        style={{
                                            padding: '12px', borderRadius: '10px',
                                            border: selectedTime === slot ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: selectedTime === slot ? '#f0f4ff' : 'white',
                                            color: selectedTime === slot ? '#2E37A4' : '#0f172a',
                                            fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                                {timeSlots.length === 0 && !hasFetchedSlots && <p style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: '14px' }}>Please select a date to see slots.</p>}
                                {timeSlots.length === 0 && hasFetchedSlots && <p style={{ gridColumn: '1 / -1', color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>No available slots for this date.</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Consultation Type</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => setConsultationType('video')}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: consultationType === 'video' ? '2px solid #2E37A4' : '1px solid #e2e8f0', background: consultationType === 'video' ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                        >Virtual Meeting</button>
                                        <button
                                            onClick={() => setConsultationType('in-person')}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: consultationType === 'in-person' ? '2px solid #2E37A4' : '1px solid #e2e8f0', background: consultationType === 'in-person' ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                        >In-Person</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Reason (Optional)</label>
                                    <select
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="General Checkup">General Checkup</option>
                                        <option value="Follow-up">Follow-up</option>
                                        <option value="Consultation">Consultation</option>
                                        <option value="Prescription Refill">Prescription Refill</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Review & Payment (The "Standard" Checkout) */}
                    {step === 3 && createdAppointment && (
                        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: isMobile ? '24px' : '40px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>Confirm & Secure Booking</h3>
                                
                                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
                                        <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#2E37A4', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>{selectedDoctor?.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Dr. {selectedDoctor?.name}</div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>{selectedDoctor?.doctor?.specialty} • {consultationType === 'video' ? 'Virtual Session' : 'In-Person Visit'}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>DATE</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700' }}>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>TIME (24H)</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700' }}>{selectedTime} HOURS</div>
                                        </div>
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Select Payment Method</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button 
                                        onClick={() => setPaymentMethod('wallet')}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', 
                                            border: paymentMethod === 'wallet' ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: paymentMethod === 'wallet' ? '#f0f4ff' : 'white', cursor: 'pointer', textAlign: 'left'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Dibia Secure Wallet</div>
                                            <div style={{ fontSize: '12px', color: isWalletSufficient ? '#16a34a' : '#ef4444', fontWeight: '600' }}>
                                                Available: ₦{walletBalance.toLocaleString()} {!isWalletSufficient && '(Insufficient)'}
                                            </div>
                                        </div>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #2E37A4', background: paymentMethod === 'wallet' ? '#2E37A4' : 'transparent' }} />
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('paystack')}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', 
                                            border: paymentMethod === 'paystack' ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: paymentMethod === 'paystack' ? '#f0f4ff' : 'white', cursor: 'pointer', textAlign: 'left'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Secure Online Payment (Paystack)</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Cards, Bank Transfer, USSD</div>
                                        </div>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #2E37A4', background: paymentMethod === 'paystack' ? '#2E37A4' : 'transparent' }} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', height: 'fit-content' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>Order Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#64748b' }}>Consultation Fee</span>
                                        <span style={{ fontWeight: '700' }}>₦{fee.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#64748b' }}>Service Tax (VAT)</span>
                                        <span style={{ fontWeight: '700' }}>₦0.00</span>
                                    </div>
                                    {paymentMethod === 'paystack' && useWalletForHybrid && walletBalance > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a' }}>
                                            <span>Wallet Credit Applied</span>
                                            <span style={{ fontWeight: '700' }}>-₦{Math.min(fee, walletBalance).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#2E37A4' }}>
                                            ₦{(paymentMethod === 'wallet' ? fee : (useWalletForHybrid ? Math.max(0, fee - walletBalance) : fee)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePayment}
                                    disabled={paymentProcessing || (paymentMethod === 'wallet' && !isWalletSufficient)}
                                    style={{ 
                                        width: '100%', padding: '18px', borderRadius: '16px', background: '#2E37A4', color: 'white', 
                                        fontWeight: '800', border: 'none', cursor: 'pointer', transition: '0.3s',
                                        opacity: (paymentProcessing || (paymentMethod === 'wallet' && !isWalletSufficient)) ? 0.6 : 1,
                                        boxShadow: '0 10px 15px -3px rgba(46, 55, 164, 0.3)'
                                    }}
                                >
                                    {paymentProcessing ? 'Authorizing...' : 'Confirm & Securely Pay'}
                                </button>
                                <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>By clicking, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#2E37A4', textDecoration: 'underline' }}>Medical Service Terms</a></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step < 3 && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <button onClick={handleBackStep} disabled={bookingLoading} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: isMobile ? '16px' : '18px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, padding: '12px' }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        onClick={step === 1 ? () => setStep(2) : initiateBooking}
                        disabled={bookingLoading || (step === 1 && !selectedDoctor) || (step === 2 && (!selectedDate || !selectedTime))}
                        style={{
                            padding: isMobile ? '16px 24px' : '18px 64px', background: '#2E37A4', color: 'white', borderRadius: '18px',
                            border: 'none', fontWeight: '900', cursor: 'pointer', opacity: (bookingLoading || (step === 1 && !selectedDoctor) || (step === 2 && (!selectedDate || !selectedTime))) ? 0.6 : 1,
                            boxShadow: '0 10px 15px -3px rgba(46, 55, 164, 0.2)', fontSize: isMobile ? '15px' : '17px', flex: isMobile ? 1 : 'unset',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {bookingLoading ? 'Processing Request...' : (step === 1 ? 'Select Slot' : 'Proceed to Checkout')}
                    </button>
                </div>
                )}
            </div>
        </div>
    );
}
