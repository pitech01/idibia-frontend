import { useState, useEffect } from 'react';
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
}

interface NewBookingProps {
    onBack: () => void;
}

export default function NewBooking({ onBack }: NewBookingProps) {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

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
            console.error(error);
            toast.error("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDoctor = (doctor: User) => {
        setSelectedDoctor(doctor);
        handleNext();
    };

    const handleNext = () => {
        if (step === 2 && (!selectedDate || !selectedTime)) {
            toast.error("Please select both date and time");
            return;
        }
        if (step < 3) setStep(step + 1);
        else if (step === 3) {
            submitBooking();
        }
    };

    const handleBackStep = () => {
        if (step > 1) setStep(step - 1);
        else onBack();
    };

    const submitBooking = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) return;

        setBookingLoading(true);
        try {
            await api.post('/appointments', {
                doctor_id: selectedDoctor.id,
                appointment_date: selectedDate,
                start_time: selectedTime,
                type: consultationType,
                reason: reason
            });
            toast.success('Booking Confirmed!');
            onBack();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setBookingLoading(false);
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
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Icons.ArrowLeft />
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>New Booking</h2>
            </div>

            {/* Content Card */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>

                {/* Progress Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: step >= i ? '#2E37A4' : '#e2e8f0',
                                    color: step >= i ? 'white' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', fontSize: '14px'
                                }}>{i}</div>
                                {i < 3 && <div style={{ width: '40px', height: '2px', background: step > i ? '#2E37A4' : '#e2e8f0' }}></div>}
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
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Select a Specialist</h3>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }}><Icons.Search /></span>
                                <input
                                    type="text"
                                    placeholder="Search doctors by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        outline: 'none', fontSize: '15px'
                                    }}
                                />
                            </div>

                            {/* Doctors Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                {filteredDoctors.length === 0 && <p>No doctors found.</p>}
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
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>Specialist</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSelectDoctor(doctor); }}
                                                    style={{
                                                        padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                                        background: 'white', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer'
                                                    }}
                                                >
                                                    Select
                                                </button>
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
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Select Date & Time</h3>

                            {/* Date Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
                                {dateOptions.map((date) => (
                                    <button
                                        key={date.value}
                                        onClick={() => setSelectedDate(date.value)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: selectedDate === date.value ? '1px solid #eef2ff' : '1px solid #e2e8f0',
                                            background: selectedDate === date.value ? '#eef2ff' : 'white',
                                            color: selectedDate === date.value ? '#2E37A4' : '#64748b',
                                            fontWeight: selectedDate === date.value ? '700' : '500',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedDate === date.value ? '0 0 0 1px #2E37A4 inset' : 'none'
                                        }}
                                    >
                                        {date.label}
                                    </button>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Available Slots</h3>

                            {/* Slots Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '40px' }}>
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: selectedTime === slot ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: selectedTime === slot ? 'white' : 'white',
                                            color: selectedTime === slot ? '#2E37A4' : '#0f172a',
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedTime === slot ? '0 0 0 1px #2E37A4 inset' : 'none'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Consultation Details</h3>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Type</label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="video"
                                            checked={consultationType === 'video'}
                                            onChange={() => setConsultationType('video')}
                                        /> Virtual Video
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="in-person"
                                            checked={consultationType === 'in-person'}
                                            onChange={() => setConsultationType('in-person')}
                                        /> In-Person
                                    </label>
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Reason / Notes</label>
                                <textarea
                                    rows={3}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Briefly describe your symptoms..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm Booking */}
                    {step === 3 && (
                        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>Confirm Booking Details</h3>

                            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '40px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Doctor</div>
                                    <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Dr. {selectedDoctor?.name}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Date</div>
                                    <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{selectedDate}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Time</div>
                                    <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{selectedTime}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                    <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Consultation Type</div>
                                    <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{consultationType === 'video' ? 'Virtual Consultation' : 'In-Person Visit'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={handleBackStep} disabled={bookingLoading} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer', padding: '12px 24px' }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={bookingLoading}
                        style={{
                            padding: '14px 40px', background: '#2E37A4', color: 'white', borderRadius: '12px',
                            border: 'none', fontWeight: '700', fontSize: '15px', cursor: bookingLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.3)', opacity: bookingLoading ? 0.7 : 1
                        }}
                    >
                        {bookingLoading ? 'Processing...' : (step === 3 ? 'Confirm Booking' : 'Continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}
