import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
    value?: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
}

const YEAR_RANGE_START = 1920;
const YEAR_RANGE_END = new Date().getFullYear();

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CustomDatePicker({ value, onChange, placeholder = "Select Date", className }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial state based on value or today
    const [currentDate] = useState(() => {
        return value ? new Date(value) : new Date();
    });

    const [viewYear, setViewYear] = useState(currentDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewYear(date.getFullYear());
                setViewMonth(date.getMonth());
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDateClick = (day: number) => {
        // Format: YYYY-MM-DD
        const month = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateStr = `${viewYear}-${month}-${d}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div className={`custom-datepicker-container ${className || ''}`} ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="form-input-clean"
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    color: value ? '#1e293b' : '#94a3b8'
                }}
            >
                <span>{value || placeholder}</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            {/* Popup */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '16px',
                        width: '280px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <button onClick={prevMonth} type="button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '5px' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div style={{ display: 'flex', gap: '5px' }}>
                            <select
                                value={viewMonth}
                                onChange={(e) => setViewMonth(Number(e.target.value))}
                                style={{ border: 'none', fontWeight: '600', color: '#1e293b', background: 'transparent', cursor: 'pointer', outline: 'none' }}
                            >
                                {MONTHS.map((m, i) => {
                                    const isFutureMonth = viewYear === new Date().getFullYear() && i > new Date().getMonth();
                                    return <option key={i} value={i} disabled={isFutureMonth}>{m}</option>;
                                })}
                            </select>
                            <select
                                value={viewYear}
                                onChange={(e) => {
                                    const newYear = Number(e.target.value);
                                    setViewYear(newYear);
                                    // If switching to current year and current month is future, reset month
                                    if (newYear === new Date().getFullYear() && viewMonth > new Date().getMonth()) {
                                        setViewMonth(new Date().getMonth());
                                    }
                                }}
                                style={{ border: 'none', fontWeight: '600', color: '#1e293b', background: 'transparent', cursor: 'pointer', outline: 'none' }}
                            >
                                {range(YEAR_RANGE_START, YEAR_RANGE_END).reverse().map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={nextMonth}
                            type="button"
                            disabled={viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth()}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth() ? 'not-allowed' : 'pointer',
                                color: viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth() ? '#e2e8f0' : '#64748b',
                                padding: '5px'
                            }}
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '5px', textAlign: 'center' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{d}</span>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }).map((_, i) => {
                            const day = i + 1;
                            const isToday = day === new Date().getDate() && viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear();
                            const isSelected = value === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                            // Check if date is in the future
                            const dateObj = new Date(viewYear, viewMonth, day);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isFuture = dateObj > today;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => !isFuture && handleDateClick(day)}
                                    disabled={isFuture}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        border: 'none',
                                        background: isSelected ? '#0ea5e9' : (isToday ? '#e0f2fe' : 'transparent'),
                                        color: isFuture ? '#cbd5e1' : (isSelected ? 'white' : '#334155'),
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        cursor: isFuture ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.1s',
                                        opacity: isFuture ? 0.6 : 1
                                    }}
                                    onMouseEnter={e => !isSelected && !isFuture && (e.currentTarget.style.background = '#f1f5f9')}
                                    onMouseLeave={e => !isSelected && !isFuture && (e.currentTarget.style.background = isToday ? '#e0f2fe' : 'transparent')}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
