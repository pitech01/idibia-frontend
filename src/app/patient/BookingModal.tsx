import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Star: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
    Verified: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    X: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface BookingModalProps {
    onClose: () => void;
}

export default function BookingModal({ onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('Jan 15');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

    const [backendDoctors, setBackendDoctors] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctors');
                setBackendDoctors(response.data);
            } catch (error) {
                console.error("Failed to fetch doctors", error);
                toast.error("Failed to load doctor list.");
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = backendDoctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.doctor?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleSelectDoctor = (doctor: any) => {
        setSelectedDoctor(doctor);
        handleNext();
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else if (step === 3) {
            toast.success('Booking Confirmed!');
            onClose();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onClose();
    };

    const confirmationDate = selectedDate === 'Today' ? 'Today, Jan 10' : (selectedDate === 'Tomorrow' ? 'Tomorrow, Jan 11' : selectedDate);
    const confirmationTime = selectedSlot || '14:00';

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

                <div style={{ padding: '32px', overflowY: 'auto' }}>
                    {step === 1 && (
                        <>
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
                                </select>
                            </div>

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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {loadingDoctors ? (
                                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading doctors...</p>
                                ) : filteredDoctors.length === 0 ? (
                                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#64748b' }}>No verified doctors available.</p>
                                ) : filteredDoctors.map((doctor) => {
                                    const initials = doctor.name.split(' ').map((n: any) => n[0]).join('');
                                    return (
                                        <div
                                            key={doctor.id}
                                            onClick={() => handleSelectDoctor(doctor)}
                                            style={{
                                                border: selectedDoctor?.id === doctor.id ? '2px solid #2E37A4' : '1px solid #e2e8f0',
                                                borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '16px', background: selectedDoctor?.id === doctor.id ? '#f5f7ff' : 'white'
                                            }}
                                        >
                                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#EEF2FF', color: '#2E37A4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>
                                                {initials}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dr. {doctor.name}</h3>
                                                    <span style={{ color: '#10b981' }}><Icons.Verified /></span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 6px' }}>{doctor.doctor?.specialty || 'General Practitioner'}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
                                                        <Icons.Star /> 4.9
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{doctor.doctor?.workplace_name || 'Verified'}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#2E37A4' }}>₦{doctor.doctor?.consultation_fee?.toLocaleString() || '5,000'}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>Select Date & Time</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                {dateOptions.map((date) => (
                                    <button
                                        key={date.value}
                                        onClick={() => setSelectedDate(date.value)}
                                        style={{
                                            padding: '16px', borderRadius: '12px', border: selectedDate === date.value ? '1px solid #eef2ff' : '1px solid #e2e8f0',
                                            background: selectedDate === date.value ? '#eef2ff' : 'white',
                                            color: selectedDate === date.value ? '#2E37A4' : '#64748b',
                                            fontWeight: selectedDate === date.value ? '600' : '500', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {date.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        style={{
                                            padding: '14px', borderRadius: '10px', border: selectedSlot === slot ? '2px solid #2E37A4' : '1px solid #f1f5f9',
                                            background: selectedSlot === slot ? '#f5f7ff' : '#f8fafc',
                                            color: selectedSlot === slot ? '#2E37A4' : '#475569',
                                            fontWeight: selectedSlot === slot ? '700' : '500', cursor: 'pointer', transition: 'all 0.1s'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && selectedDoctor && (
                        <div className="animate-fade-in">
                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#EEF2FF', color: '#2E37A4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                                        {selectedDoctor.name[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Dr. {selectedDoctor.name}</h3>
                                        <p style={{ fontSize: '15px', color: '#64748b', margin: '4px 0 0' }}>{selectedDoctor.doctor?.specialty}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Date</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>{confirmationDate}</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Time</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>{confirmationTime}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '0 8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>Consultation Fee</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>₦{selectedDoctor.doctor?.consultation_fee?.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Total Amount</span>
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#2E37A4' }}>₦{selectedDoctor.doctor?.consultation_fee?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' }}>
                    <button onClick={handleBack} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={step === 1 && !selectedDoctor || step === 2 && !selectedSlot}
                        style={{
                            padding: '12px 40px', borderRadius: '10px', border: 'none',
                            background: (step === 1 && !selectedDoctor || step === 2 && !selectedSlot) ? '#cbd5e1' : '#2E37A4',
                            color: 'white', fontWeight: '700', cursor: (step === 1 && !selectedDoctor || step === 2 && !selectedSlot) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.15)'
                        }}
                    >
                        {step === 3 ? 'Confirm & Pay' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
