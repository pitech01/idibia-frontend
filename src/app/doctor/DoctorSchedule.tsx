import { useState, useEffect } from 'react';
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
    const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
    const [schedule, setSchedule] = useState<DailySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await api.get('/doctor/schedule');
                const appointments = response.data;

                // Map API appointments to Timeline Slots
                const timeline: DailySlot[] = appointments.map((appt: any) => ({
                    id: appt.id,
                    time: appt.start_time.substring(0, 5),
                    status: 'booked',
                    patientName: `${appt.patient?.first_name} ${appt.patient?.last_name}`,
                    type: 'virtual', // Default or fetch form backend if exists
                    duration: '30 min'
                }));

                // Fill gaps with available slots (Mock logic for now)
                // In a real app, we'd generate slots based on doctor's availability
                if (timeline.length === 0) {
                    timeline.push({ time: '09:00', status: 'available' });
                    timeline.push({ time: '10:00', status: 'available' });
                }

                setSchedule(timeline);
                setUpcomingAppointments(appointments); // For now use same list
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [selectedDate]); // Add date dependency if we implement date selection

    // Mock Calendar Data (Dynamic based on current date)
    const today = new Date();
    const calendarDays: CalendarDay[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + 1 + i); // Start from Monday
        return {
            day: d.getDate(),
            weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
            status: d < today ? 'past' : 'free', // specific status logic can be added later
            isToday: d.getDate() === today.getDate(),
            dateStr: d.toISOString().split('T')[0]
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
                    <button className="doc-btn doc-btn-primary" onClick={() => window.location.href = '/settings#availability'}>
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
                        <h3>{upcomingAppointments.length}</h3>
                        <p>Booked Today</p>
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
                {/* ... other stats static for now */}
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
                                    key={day.day}
                                    onClick={() => setSelectedDate(day.day)}
                                    style={{
                                        padding: '16px 8px',
                                        borderRadius: '12px',
                                        background: selectedDate === day.day ? '#eff6ff' : 'transparent',
                                        border: selectedDate === day.day ? '1px solid #2563eb' : '1px solid transparent',
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
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Icons.VideoCamera />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patient?.first_name} {apt.patient?.last_name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>{apt.start_time.substring(0, 5)} • Video Call</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="doc-btn doc-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Details</button>
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

                    {/* Insight Card - Reusing static for now but updated dynamic values where possible */}
                    <div className="doc-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', border: 'none', marginBottom: 0 }}>
                        {/* ... kept mostly static for layout preservation ... */}
                        <div className="doc-card-header" style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                            <h3 className="doc-card-title" style={{ color: 'white', fontSize: '14px' }}>Schedule Insights</h3>
                            <Icons.Info />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', lineHeight: 1 }}>4h</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Free Today</div>
                            </div>
                            {/* ... */}
                        </div>
                    </div>

                    {/* Daily Timeline */}
                    <div className="doc-card" style={{ flex: 1, height: 'fit-content' }}>
                        <div className="doc-card-header">
                            <h3 className="doc-card-title">Today's Timeline</h3>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{today.toDateString()}</div>
                        </div>

                        <div style={{ paddingLeft: '8px' }}>
                            {schedule.map((slot, index) => (
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
