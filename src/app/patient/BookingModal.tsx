import { useState } from 'react';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Star: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
    Verified: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    X: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface Doctor {
    id: number;
    initials: string;
    bgColor: string;
    textColor: string;
    name: string;
    rating: number;
    title: string;
    institution: string;
    price: string;
}

interface BookingModalProps {
    onClose: () => void;
}

export default function BookingModal({ onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('Jan 15');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const doctors: Doctor[] = [
        { id: 1, initials: 'DC', bgColor: '#EEF2FF', textColor: '#2E37A4', name: 'Dr. Chioma Okeke', rating: 4.8, title: 'General Practitioner', institution: 'LUTH Verified', price: '₦5,000' },
        { id: 2, initials: 'DE', bgColor: '#EEF2FF', textColor: '#2E37A4', name: 'Dr. Emeka Nwosu', rating: 4.9, title: 'Cardiologist', institution: 'UCH Ibadan', price: '₦8,000' },
        { id: 3, initials: 'DF', bgColor: '#EEF2FF', textColor: '#2E37A4', name: 'Dr. Fatima Bello', rating: 4.7, title: 'Dermatologist', institution: 'LASUTH Verified', price: '₦6,500' },
        { id: 4, initials: 'DO', bgColor: '#EEF2FF', textColor: '#2E37A4', name: 'Dr. Olumide Adeyemi', rating: 4.6, title: 'Pediatrician', institution: 'FMC Abeokuta', price: '₦4,500' },
    ];

    const dateOptions = [
        { label: 'Today', value: 'Today' },
        { label: 'Tomorrow', value: 'Tomorrow' },
        { label: 'Jan 12', value: 'Jan 12' },
        { label: 'Jan 13', value: 'Jan 13' },
        { label: 'Jan 14', value: 'Jan 14' },
        { label: 'Jan 15', value: 'Jan 15' },
        { label: 'Jan 16', value: 'Jan 16' },
        { label: 'Jan 17', value: 'Jan 17' },
    ];

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    const handleSelectDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        handleNext();
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else if (step === 3) {
            // Setup confirmation logic here
            alert('Booking Confirmed!');
            onClose();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onClose();
    };

    // Derived values for summary
    const confirmationDate = selectedDate === 'Today' ? 'Today, Jan 10' : (selectedDate === 'Tomorrow' ? 'Tomorrow, Jan 11' : selectedDate);
    const confirmationTime = selectedSlot || '14:00'; // Fallback if no slot selected

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
            <div className="animate-fade-in" style={{
                background: 'white',
                borderRadius: '16px',
                width: '850px',
                maxWidth: '95%',
                height: 'auto',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Book a Doctor</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Step {step} of 3
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: step >= i ? '#2E37A4' : '#e2e8f0'
                                    }} />
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <Icons.X />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '32px', overflowY: 'auto' }}>

                    {/* STEP 1: Select Doctor */}
                    {step === 1 && (
                        <>
                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <select style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid #2E37A4', background: '#f8fafc', color: '#0f172a', fontWeight: '500', outline: 'none' }}>
                                    <option>Specialty</option>
                                    <option>General Practitioner</option>
                                    <option>Cardiologist</option>
                                    <option>Dermatologist</option>
                                </select>
                                <select style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', outline: 'none' }}>
                                    <option>Language</option>
                                    <option>English</option>
                                    <option>French</option>
                                    <option>Hausa</option>
                                </select>
                                <select style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', outline: 'none' }}>
                                    <option>Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Any</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }}><Icons.Search /></span>
                                <input
                                    type="text"
                                    placeholder="Search doctors by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        outline: 'none', fontSize: '15px'
                                    }}
                                />
                            </div>

                            {/* Doctors Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                {doctors.map(doctor => (
                                    <div key={doctor.id} style={{
                                        border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px',
                                        display: 'flex', gap: '16px', transition: 'all 0.2s', background: 'white',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '12px', background: doctor.bgColor,
                                            color: doctor.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px', fontWeight: '700', flexShrink: 0
                                        }}>
                                            {doctor.initials}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{doctor.name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                                    <span style={{ color: '#f59e0b', display: 'flex' }}><Icons.Star /></span> {doctor.rating}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>{doctor.title}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                                                <span style={{ color: '#2E37A4' }}><Icons.Verified /></span> {doctor.institution}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2E37A4' }}>{doctor.price}</div>
                                                <button
                                                    onClick={() => handleSelectDoctor(doctor)}
                                                    style={{
                                                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                                        background: 'white', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer'
                                                    }}
                                                >
                                                    Select Slot
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
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>Select Date & Time</h3>

                            {/* Date Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
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
                                            fontWeight: selectedDate === date.value ? '600' : '500',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {date.label}
                                    </button>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>Available Slots</h3>

                            {/* Slots Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: selectedSlot === slot ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                            background: selectedSlot === slot ? 'white' : 'white',
                                            color: selectedSlot === slot ? '#2E37A4' : '#0f172a',
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedSlot === slot ? '0 0 0 1px #2E37A4 inset' : 'none'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm Booking */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '16px', color: '#334155', fontWeight: '500', marginBottom: '16px' }}>Confirm Booking</h3>

                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Doctor</div>
                                    <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{selectedDoctor?.name || 'Dr. Chioma Okeke'}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Date</div>
                                    <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{confirmationDate}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Time</div>
                                    <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{confirmationTime}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Type</div>
                                    <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>Virtual Consultation</div>
                                </div>

                                <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '20px' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Total</div>
                                    <div style={{ color: '#2E37A4', fontSize: '18px', fontWeight: '800' }}>{selectedDoctor?.price || '₦5,000'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Back</button>
                    <button
                        onClick={handleNext}
                        style={{
                            padding: '12px 32px', background: '#2E37A4', color: 'white', borderRadius: '8px',
                            border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                        }}
                    >
                        {step === 3 ? 'Confirm & Pay' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
