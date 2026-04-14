import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../services';
import Preloader from '../../components/Preloader';
import WebRTCCall from '../../components/WebRTCCall';



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
    weekDay: string;
    status: 'full' | 'partial' | 'free' | 'past';
    isToday?: boolean;
    dateStr: string;
    isCurrentMonth: boolean;
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
    const [showWebRTCCall, setShowWebRTCCall] = useState(false);
    const [activeCallAppointment, setActiveCallAppointment] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [viewDate, setViewDate] = useState<Date>(new Date());

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
            const [scheduleRes, availabilityRes, userRes] = await Promise.all([
                api.get(`/doctor/schedule?date=${selectedDate}`),
                api.get('/doctor/availability'),
                api.get('/user')
            ]);
            setCurrentUser(userRes.data);

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

    // Full Calendar Grid Generation
    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days: CalendarDay[] = [];
        const firstDayIndex = date.getDay(); // 0 for Sunday
        
        // Adjust standard firstDayIndex to Monday-start if preferred
        // We'll stick to Sunday start (Standard)
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        // 1. Padding from Previous Month
        for (let i = firstDayIndex; i > 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i + 1);
            days.push({
                day: d.getDate(),
                weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status: 'past' as const,
                dateStr: getLocalISOString(d),
                isCurrentMonth: false
            });
        }
        
        // 2. Current Month days
        for (let i = 1; i <= lastDay; i++) {
            const d = new Date(year, month, i);
            const isPast = d.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
            days.push({
                day: i,
                weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status: isPast ? 'past' as const : 'free' as const,
                dateStr: getLocalISOString(d),
                isToday: d.toDateString() === new Date().toDateString(),
                isCurrentMonth: true
            });
        }
        
        // 3. Padding from Next Month to fill 42 cells (6 rows)
        const totalSlots = 42; 
        const nextMonthPadding = totalSlots - days.length;
        for (let i = 1; i <= nextMonthPadding; i++) {
            const d = new Date(year, month + 1, i);
            days.push({
                day: d.getDate(),
                weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status: 'free' as const,
                dateStr: getLocalISOString(d),
                isCurrentMonth: false
            });
        }
        
        return days;
    };

    const calendarDays = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleGoToToday = () => {
        const now = new Date();
        setViewDate(now);
        setSelectedDate(getLocalISOString(now));
    };

    if (loading) return <Preloader />;

    return (
        <div className="doc-content-area animate-fade-in" style={{ paddingBottom: '40px' }}>
            {showWebRTCCall && activeCallAppointment && (
                <WebRTCCall
                    appointmentId={activeCallAppointment.id}
                    userId={currentUser?.id}
                    userName={currentUser?.name || 'Doctor'}
                    receiverId={activeCallAppointment.patient_id}
                    isDoctor={true}
                    onClose={() => {
                        setShowWebRTCCall(false);
                        setActiveCallAppointment(null);
                    }}
                />
            )}

            {/* Header */}
            <div className="doc-page-header">
                <div className="doc-page-title">
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Schedule & Availability</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Overview of your appointments and free time.</p>
                </div>
                <div className="doc-page-actions">
                    <button className="doc-btn doc-btn-secondary" style={{ fontSize: '13px' }}>
                        <Icons.Filter /> <span className="desktop-only">Unresolved Requests</span><span className="mobile-only">Requests</span>
                    </button>
                    <button className="doc-btn doc-btn-primary" onClick={() => setShowAvailabilityModal(true)}>
                        <span className="desktop-only">Manage Availability</span><span className="mobile-only">Manage</span>
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
                        <div className="doc-card-header" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <h3 className="doc-card-title" style={{ margin: 0 }}>
                                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h3>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={handlePrevMonth} className="icon-btn-sm" style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={handleNextMonth} className="icon-btn-sm" style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button onClick={handleGoToToday} style={{ fontSize: '12px', fontWeight: '700', color: '#2E37A4', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Today</button>
                                <div className="calendar-legends-grid" style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', fontWeight: 'bold' }}>Free</span>
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#fff1f2', color: '#be123c', fontWeight: 'bold' }}>Full</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px', textAlign: 'center' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="full-calendar-grid">
                            {calendarDays.map((day, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDate(day.dateStr)}
                                    className={`calendar-cell ${selectedDate === day.dateStr ? 'active' : ''} ${!day.isCurrentMonth ? 'other-month' : ''} ${day.status === 'past' ? 'past' : ''}`}
                                >
                                    <div className="cell-content">
                                        <span className="day-num">{day.day}</span>
                                        {day.isToday && <div className="today-dot" />}
                                    </div>
                                    <div className="status-indicator">
                                        <div className={`status-dot ${day.status}`} />
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
                                <div key={apt.id} className="doc-card appointment-card-compact">
                                    <div className="appointment-header">
                                        <div className="date-badge">
                                            <span className="day">{new Date(apt.appointment_date).getDate()}</span>
                                            <span className="month">{new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div className="patient-basic-info">
                                            <div className="name">{apt.patient?.name || 'Unknown Patient'}</div>
                                            <div className="time">{apt.start_time.substring(0, 5)} • {apt.appointment_date}</div>
                                        </div>
                                    </div>
                                    <div className="appointment-actions">
                                        <button
                                            className="doc-btn doc-btn-secondary"
                                            onClick={() => setSelectedAppointment(apt)}
                                        >
                                            Details
                                        </button>
                                        <button 
                                            className="doc-btn doc-btn-primary" 
                                            onClick={() => {
                                                setActiveCallAppointment(apt);
                                                setShowWebRTCCall(true);
                                            }}
                                        >Join</button>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#64748b', padding: '16px', textAlign: 'center' }}>No upcoming appointments found.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Insight Card */}
                    <div className="doc-card insight-premium-card">
                        <div className="insight-header">
                            <div>
                                <h3 className="insight-title">Schedule Insights</h3>
                                <p className="insight-subtitle">Performance & Capacity</p>
                            </div>
                            <div className="insight-icon-box">
                                <Icons.Info />
                            </div>
                        </div>
                        
                        <div className="insight-grid">
                            <div className="insight-stat-item">
                                <label>Free Time</label>
                                <div className="val">
                                    {Math.floor((schedule.filter(s => s.status === 'available').length * (consultationDuration || 30)) / 60)}h 
                                    <span>{(schedule.filter(s => s.status === 'available').length * (consultationDuration || 30)) % 60}m</span>
                                </div>
                                <div className="insight-progress-bg">
                                    <div className="insight-progress-bar" style={{ width: '45%', background: '#10b981' }}></div>
                                </div>
                            </div>
                            
                            <div className="insight-stat-item">
                                <label>Utilization</label>
                                <div className="val">
                                    {schedule.length > 0 ? Math.round((schedule.filter(s => s.status === 'booked').length / schedule.length) * 100) : 0}%
                                </div>
                                <div className="insight-progress-bg">
                                    <div className="insight-progress-bar" style={{ 
                                        width: `${schedule.length > 0 ? (schedule.filter(s => s.status === 'booked').length / schedule.length) * 100 : 0}%`, 
                                        background: '#3b82f6' 
                                    }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="insight-footer-note">
                            <div className="pulse-dot"></div>
                            <span>Most active hours: 09:00 AM - 12:00 PM</span>
                        </div>
                    </div>

                    {/* Daily Timeline */}
                    <div className="doc-card" style={{ flex: 1, height: 'fit-content' }}>
                        <div className="doc-card-header">
                            <h3 className="doc-card-title">Daily Timeline</h3>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(selectedDate).toDateString()}</div>
                        </div>

                        <div className="timeline-container">
                            {schedule.length > 0 ? schedule.map((slot, index) => (
                                <div key={index} className={`timeline-entry ${slot.status}`}>
                                    <div className="entry-time">{slot.time}</div>
                                    <div className="entry-indicator">
                                        <div className="indicator-dot"></div>
                                        {index < schedule.length - 1 && <div className="indicator-line"></div>}
                                    </div>
                                    <div className={`entry-card ${slot.status}`}>
                                        <div className="entry-card-header">
                                            {slot.status === 'booked' ? (
                                                <>
                                                    <div className="patient-meta">
                                                        <h4 className="patient-name">{slot.patientName}</h4>
                                                        <span className="consultation-pill">{slot.type || 'Video'}</span>
                                                    </div>
                                                    <div className="entry-actions">
                                                        <button className="entry-btn-icon"><Icons.ChevronRight /></button>
                                                    </div>
                                                </>
                                            ) : slot.status === 'available' ? (
                                                <div className="availability-meta">
                                                    <span className="status-label">Available Slot</span>
                                                    <p className="status-desc">{slot.duration || consultationDuration} min block</p>
                                                </div>
                                            ) : (
                                                <div className="blocked-meta">
                                                    <span className="status-label">Blocked Time</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-timeline">
                                    <div className="empty-icon"><Icons.Calendar /></div>
                                    <p>No activity for this date</p>
                                </div>
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

                            <div className="modal-section-header">
                                <Icons.Clock />
                                <h3>Weekly Work Hours</h3>
                            </div>

                            <div className="availability-list">
                                {availabilityForm.map((slot, index) => (
                                    <div key={slot.day} className={`availability-card ${slot.is_available ? 'active' : 'inactive'}`}>
                                        <div className="availability-card-main">
                                            <div className="day-info">
                                                <span className="day-name">{slot.day}</span>
                                                <span className="day-status">{slot.is_available ? 'Open for appointments' : 'No appointments'}</span>
                                            </div>
                                            
                                            <div className="availability-actions">
                                                <div 
                                                    className={`doc-switch ${slot.is_available ? 'on' : 'off'}`}
                                                    onClick={() => {
                                                        const newForm = [...availabilityForm];
                                                        newForm[index].is_available = !newForm[index].is_available;
                                                        setAvailabilityForm(newForm);
                                                    }}
                                                >
                                                    <div className="switch-knob"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {slot.is_available && (
                                            <div className="availability-time-config animate-slide-up">
                                                <div className="config-group">
                                                    <label>Shift Start</label>
                                                    <input
                                                        type="time"
                                                        value={slot.start_time}
                                                        onChange={e => {
                                                            const newForm = [...availabilityForm];
                                                            newForm[index].start_time = e.target.value;
                                                            setAvailabilityForm(newForm);
                                                        }}
                                                        className="doc-time-input"
                                                    />
                                                </div>
                                                <div className="time-divider">to</div>
                                                <div className="config-group">
                                                    <label>Shift End</label>
                                                    <input
                                                        type="time"
                                                        value={slot.end_time}
                                                        onChange={e => {
                                                            const newForm = [...availabilityForm];
                                                            newForm[index].end_time = e.target.value;
                                                            setAvailabilityForm(newForm);
                                                        }}
                                                        className="doc-time-input"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                            <div className="patient-info-modal-section">
                                <div className="patient-avatar-large">
                                    <Icons.Users />
                                </div>
                                <div className="patient-text-details">
                                    <h3 className="patient-name-title">
                                        {selectedAppointment.patient?.name || 'Unknown Patient'}
                                    </h3>
                                    <div className="patient-contact-links">
                                        <span className="contact-chip">
                                            📧 {selectedAppointment.patient?.email}
                                        </span>
                                        <span className="contact-chip">
                                            📱 {selectedAppointment.patient?.phone || 'N/A'}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        <span className="role-tag">Patient</span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details Grid */}
                            <div className="appointment-details-modal-grid">
                                <div className="detail-item-box">
                                    <label>Date & Time</label>
                                    <div className="val">
                                        <Icons.Calendar />
                                        {selectedAppointment.appointment_date}
                                        <span className="sep">|</span>
                                        {selectedAppointment.start_time.substring(0, 5)}
                                    </div>
                                </div>
                                <div className="detail-item-box">
                                    <label>Status</label>
                                    <div className="val">
                                        <span className={`status-pill ${selectedAppointment.status}`}>
                                            {selectedAppointment.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-item-box">
                                    <label>Visit Type</label>
                                    <div className="val">
                                        <Icons.VideoCamera />
                                        Video Consultation
                                    </div>
                                </div>
                                <div className="detail-item-box">
                                    <label>Complaint</label>
                                    <div className="val complaint-text">
                                        {selectedAppointment.reason || "No specific reason provided."}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="modal-actions-footer">
                                <button 
                                    className="doc-btn doc-btn-primary full-width-mobile" 
                                    onClick={() => {
                                        setActiveCallAppointment(selectedAppointment);
                                        setShowWebRTCCall(true);
                                    }}
                                >
                                    <Icons.VideoCamera />
                                    Join Meeting
                                </button>
                                <button className="doc-btn doc-btn-secondary full-width-mobile">
                                    Reschedule
                                </button>
                                <button
                                    className="doc-btn cancel-btn full-width-mobile"
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
