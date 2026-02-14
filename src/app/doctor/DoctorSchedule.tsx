import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../services';
import Preloader from '../../components/Preloader';

// Icons
const Icons = {
    Calendar: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    CheckCircle: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    VideoCamera: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    ChevronRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    Info: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// Types
type SlotStatus = 'booked' | 'available' | 'blocked';
interface DailySlot {
    time: string;
    status: SlotStatus;
    patientName?: string;
    type?: 'virtual' | 'physical';
    duration?: string;
    id?: number;
}

interface CalendarDay {
    day: number;
    weekDay: string; // Mon, Tue, etc
    status: 'full' | 'partial' | 'free' | 'past';
    isToday?: boolean;
    dateStr: string;
}

export default function DoctorSchedule() {
    // Helper to get local YYYY-MM-DD string
    const getLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState<string>(getLocalISOString(new Date()));
    const [schedule, setSchedule] = useState<DailySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [consultationDuration, setConsultationDuration] = useState<number>(30); // Default 30 mins
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [availabilityForm, setAvailabilityForm] = useState([
        { day: 'Monday', start_time: '09:00', end_time: '17:00', is_available: true },
        { day: 'Tuesday', start_time: '09:00', end_time: '17:00', is_available: true },
        { day: 'Wednesday', start_time: '09:00', end_time: '17:00', is_available: true },
        { day: 'Thursday', start_time: '09:00', end_time: '17:00', is_available: true },
        { day: 'Friday', start_time: '09:00', end_time: '17:00', is_available: true },
        { day: 'Saturday', start_time: '10:00', end_time: '14:00', is_available: false },
        { day: 'Sunday', start_time: '00:00', end_time: '00:00', is_available: false },
    ]);

    useEffect(() => {
        fetchScheduleAndAvailability();
    }, [selectedDate]);

    const fetchScheduleAndAvailability = async () => {
        try {
            const [scheduleRes, availabilityRes] = await Promise.all([
                api.get(`/doctor/schedule?date=${selectedDate}`),
                api.get('/doctor/availability')
            ]);

            const appointments = scheduleRes.data.appointments; // Daily appointments
            const upcoming = scheduleRes.data.upcoming || [];   // Future appointments
            setUpcomingAppointments(upcoming);

            const pendingCount = scheduleRes.data.pending_count;
            setPendingRequestsCount(pendingCount);
            const fetchedAvailability = availabilityRes.data.availabilities || [];

            if (availabilityRes.data.doctor?.consultation_duration) {
                setConsultationDuration(availabilityRes.data.doctor.consultation_duration);
            }

            // Populate form if data exists
            if (fetchedAvailability.length > 0) {
                // Map fetched availability to form state, preserving structure
                const newForm = availabilityForm.map(daySlot => {
                    const found = fetchedAvailability.find((f: any) => f.day === daySlot.day);
                    if (found) {
                        return {
                            ...daySlot,
                            start_time: found.start_time.substring(0, 5),
                            end_time: found.end_time.substring(0, 5),
                            is_available: Boolean(found.is_available)
                        };
                    }
                    return daySlot;
                });
                setAvailabilityForm(newForm);
            }

            // Construct Timeline
            const timeline: DailySlot[] = [];

            // 1. Add Booked Appointments
            appointments.forEach((appt: any) => {
                timeline.push({
                    id: appt.id,
                    time: appt.start_time.substring(0, 5),
                    status: 'booked',
                    patientName: appt.patient?.name || 'Unknown Patient',
                    type: 'virtual',
                    duration: `${availabilityRes.data.doctor?.consultation_duration || 30} min`
                });
            });

            // 2. Add Available Slots based on Availability for the selected day
            // Parse the selected date string (YYYY-MM-DD) as LOCAL time, not UTC
            const [y, m, d] = selectedDate.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d); // Local date
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            const dayAvailability = fetchedAvailability.find((a: any) => a.day === dayName);

            if (dayAvailability && dayAvailability.is_available) {
                const duration = availabilityRes.data.doctor?.consultation_duration || 30;

                // Parse start time (HH:MM)
                let [startHour, startMinute] = dayAvailability.start_time.split(':').map(Number);
                const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number);

                let currentMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                while (currentMinutes + duration <= endMinutes) {
                    const h = Math.floor(currentMinutes / 60);
                    const m = currentMinutes % 60;
                    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; // HH:MM

                    // Check conflict
                    const isBooked = timeline.some(t => t.time === timeStr);
                    if (!isBooked) {
                        timeline.push({ time: timeStr, status: 'available' });
                    }

                    currentMinutes += duration;
                }
            } else if (timeline.length === 0 && (!dayAvailability || !dayAvailability.is_available)) {
                // No availability set or unavailable
            }

            // Sort by time
            timeline.sort((a, b) => a.time.localeCompare(b.time));

            setSchedule(timeline);
            // setUpcomingAppointments(appointments); // REMOVED: Now using 'upcoming' from response
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAvailability = async () => {
        try {
            await api.post('/doctor/availability', {
                availabilities: availabilityForm,
                consultation_duration: consultationDuration
            });
            toast.success('Availability updated successfully');
            setShowAvailabilityModal(false);
            fetchScheduleAndAvailability();
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    // Mock Calendar Data
    const today = new Date();
    const calendarDays: CalendarDay[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + 1 + i); // Start from Monday

        let status: 'full' | 'partial' | 'free' | 'past' = d.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0) ? 'past' : 'free';

        return {
            day: d.getDate(),
            weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
            status: status,
            isToday: d.getDate() === new Date().getDate(),
            dateStr: getLocalISOString(d)
        };
    });

    if (loading) return <Preloader />;

    return (
        <div className="doc-content-area animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Schedule & Availability</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Overview of your appointments and free time.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="doc-btn doc-btn-secondary" style={{ fontSize: '13px' }}>
                        <Icons.Filter /> Unresolved Requests
                    </button>
                    <button className="doc-btn doc-btn-primary" onClick={() => setShowAvailabilityModal(true)}>
                        Manage Availability
                    </button>
                </div>
            </div>

            {/* Top Section: Summary Cards */}
            <div className="doc-stats-grid">
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <Icons.Users />
                    </div>
                    <div className="stat-info">
                        <h3>{pendingRequestsCount}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}>
                        <Icons.Calendar />
                    </div>
                    <div className="stat-info">
                        <h3>{schedule.filter(s => s.status === 'booked').length}</h3>
                        <p>Confirmed (Today)</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <Icons.Clock />
                    </div>
                    <div className="stat-info">
                        <h3>{schedule.filter(s => s.status === 'available').length}</h3>
                        <p>Available Slots</p>
                    </div>
                </div>
            </div>

            {/* Main Section: Split Layout */}
            <div className="doc-grid-split">
                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Weekly Calendar */}
                    <div className="doc-card">
                        <div className="doc-card-header">
                            <h3 className="doc-card-title">Weekly Overview</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>Free</span>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb' }}>Partial</span>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: '#fff1f2', color: '#be123c' }}>Full</span>
                            </div>
                        </div>
                        {/* Calendar Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
                            {calendarDays.map((day) => (
                                <div
                                    key={day.dateStr}
                                    onClick={() => setSelectedDate(day.dateStr)}
                                    style={{
                                        padding: '16px 8px',
                                        borderRadius: '12px',
                                        background: selectedDate === day.dateStr ? '#eff6ff' : 'transparent',
                                        border: selectedDate === day.dateStr ? '1px solid #2563eb' : '1px solid transparent',
                                        cursor: 'pointer',
                                        opacity: day.status === 'past' ? 0.5 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{day.weekDay}</div>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%', background: day.isToday ? '#2563eb' : 'white',
                                        color: day.isToday ? 'white' : '#0f172a', fontWeight: '700', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: day.isToday ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none', border: day.isToday ? 'none' : '1px solid #e2e8f0'
                                    }}>
                                        {day.day}
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: day.status === 'full' ? '#ef4444' : day.status === 'partial' ? '#fbbf24' : day.status === 'free' ? '#22c55e' : '#cbd5e1'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming List */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Upcoming Appointments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingAppointments.length > 0 ? upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="doc-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '12px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 'bold'
                                        }}>
                                            <span>{new Date(apt.appointment_date).getDate()}</span>
                                            <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patient?.name || 'Unknown Patient'}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>{apt.start_time.substring(0, 5)} • {apt.appointment_date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            className="doc-btn doc-btn-secondary"
                                            style={{ padding: '8px 16px', fontSize: '13px' }}
                                            onClick={() => setSelectedAppointment(apt)}
                                        >
                                            Details
                                        </button>
                                        <button className="doc-btn doc-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Join</button>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#64748b' }}>No upcoming appointments found.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Insight Card */}
                    <div className="doc-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', border: 'none', marginBottom: 0 }}>
                        <div className="doc-card-header" style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                            <h3 className="doc-card-title" style={{ color: 'white', fontSize: '14px' }}>Schedule Insights</h3>
                            <Icons.Info />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', lineHeight: 1 }}>{schedule.filter(s => s.status === 'available').length}h</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Free Hours</div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Timeline */}
                    <div className="doc-card" style={{ flex: 1, height: 'fit-content' }}>
                        <div className="doc-card-header">
                            <h3 className="doc-card-title">Daily Timeline</h3>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(selectedDate).toDateString()}</div>
                        </div>

                        <div style={{ paddingLeft: '8px' }}>
                            {schedule.length > 0 ? schedule.map((slot, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-line"></div>
                                    {/* Icon */}
                                    <div className={`timeline-icon`} style={{
                                        background: slot.status === 'booked' ? '#eff6ff' : slot.status === 'available' ? '#f0fdf4' : '#f1f5f9',
                                        color: slot.status === 'booked' ? '#2563eb' : slot.status === 'available' ? '#16a34a' : '#94a3b8',
                                        border: slot.status === 'booked' ? '1px solid #dbeafe' : 'none'
                                    }}>
                                        {slot.status === 'booked' ? <Icons.Users /> : slot.status === 'available' ? <Icons.CheckCircle /> : <div style={{ width: '8px', height: '8px', background: '#cbd5e1', borderRadius: '50%' }} />}
                                    </div>

                                    {/* Content */}
                                    <div className="timeline-content" style={{ flex: 1 }}>
                                        <div className="timeline-time">{slot.time}</div>

                                        {slot.status === 'booked' ? (
                                            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '12px', marginTop: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <h4 style={{ color: '#1e40af', margin: 0 }}>{slot.patientName}</h4>
                                                    <span style={{ fontSize: '10px', background: 'white', padding: '2px 6px', borderRadius: '4px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase' }}>{slot.type}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#60a5fa' }}>{slot.duration} Appointment</p>
                                            </div>
                                        ) : slot.status === 'available' ? (
                                            <div style={{
                                                background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '8px', padding: '8px 12px', marginTop: '4px',
                                                color: '#15803d', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                Available
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                                                Blocked
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '20px', color: '#64748b' }}>No availability set for this day.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Availability Modal */}
            {showAvailabilityModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Manage Weekly Availability</h3>
                            <button onClick={() => setShowAvailabilityModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ marginBottom: '8px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                    Consultation Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    step="5"
                                    value={consultationDuration}
                                    onChange={(e) => setConsultationDuration(parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>This will determine the length of each appointment slot.</p>
                            </div>

                            {availabilityForm.map((slot, index) => (
                                <div key={slot.day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ width: '100px', fontWeight: '600' }}>{slot.day}</div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginRight: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={slot.is_available}
                                            onChange={e => {
                                                const newForm = [...availabilityForm];
                                                newForm[index].is_available = e.target.checked;
                                                setAvailabilityForm(newForm);
                                            }}
                                        />
                                        Available
                                    </label>

                                    {slot.is_available && (
                                        <>
                                            <input
                                                type="time"
                                                value={slot.start_time}
                                                onChange={e => {
                                                    const newForm = [...availabilityForm];
                                                    newForm[index].start_time = e.target.value;
                                                    setAvailabilityForm(newForm);
                                                }}
                                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                value={slot.end_time}
                                                onChange={e => {
                                                    const newForm = [...availabilityForm];
                                                    newForm[index].end_time = e.target.value;
                                                    setAvailabilityForm(newForm);
                                                }}
                                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowAvailabilityModal(false)} className="doc-btn doc-btn-secondary">Cancel</button>
                            <button onClick={handleSaveAvailability} className="doc-btn doc-btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* Appointment Details Modal */}
            {selectedAppointment && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '0', borderRadius: '24px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                        {/* Modal Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Appointment Details</h2>
                                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>ID: #{selectedAppointment.id}</p>
                            </div>
                            <button onClick={() => setSelectedAppointment(null)} style={{ border: 'none', background: 'transparent', fontSize: '24px', color: '#64748b', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            {/* Patient Info Section */}
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#cbd5e1'
                                }}>
                                    <Icons.Users />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                                        {selectedAppointment.patient?.name || 'Unknown Patient'}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📧 {selectedAppointment.patient?.email}
                                        </span>
                                        {/* Placeholders for fields not yet in DB */}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📱 {selectedAppointment.patient?.phone || 'N/A'}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        <span style={{
                                            background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '99px',
                                            fontSize: '12px', fontWeight: '600', display: 'inline-block'
                                        }}>
                                            Patient
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</label>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Icons.Calendar />
                                        {selectedAppointment.appointment_date}
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        {selectedAppointment.start_time.substring(0, 5)}
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{
                                            background: selectedAppointment.status === 'confirmed' ? '#f0fdf4' : '#fff7ed',
                                            color: selectedAppointment.status === 'confirmed' ? '#16a34a' : '#ea580c',
                                            padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'capitalize'
                                        }}>
                                            {selectedAppointment.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visit Type</label>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Icons.VideoCamera />
                                        Video Consultation
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint</label>
                                    <div style={{ fontSize: '14px', color: '#334155', marginTop: '8px' }}>
                                        {selectedAppointment.reason || "No specific reason provided."}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                                <button className="doc-btn doc-btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <Icons.VideoCamera />
                                    Join Meeting
                                </button>
                                <button className="doc-btn doc-btn-secondary" style={{ flex: 1 }}>
                                    Reschedule
                                </button>
                                <button
                                    className="doc-btn"
                                    style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: 'none' }}
                                    onClick={() => {
                                        toast.error('Cancel functionality coming soon');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
