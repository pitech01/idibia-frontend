import { useState, useRef, useEffect } from 'react';

interface DoctorHeaderProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
    user?: any;
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    onNavigateToProfile?: () => void;
}

const Icons = {
    Bell: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
};

export default function DoctorHeader({ sidebarOpen, setSidebarOpen, user, onNavigateToProfile }: DoctorHeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = [
        { id: 1, title: 'New Appointment', desc: 'Patient John Doe booked a session', time: '5m ago' },
        { id: 2, title: 'EHR Update', desc: 'Medical record shared by Nurse Joy', time: '2h ago' },
        { id: 3, title: 'Intelligence Center', desc: 'New health trends in your specialty', time: '1d ago' },
    ];

    return (
        <header className="doc-header" style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 100, 
            backdropFilter: 'blur(10px)', 
            background: 'rgba(255, 255, 255, 0.85)',
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
            height: '80px',
            padding: '0 24px'
        }}>
            {/* Left: Hamburger Icon */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                    onClick={() => setSidebarOpen?.(!sidebarOpen)}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#0f172a', 
                        cursor: 'pointer', 
                        padding: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '12px',
                        transition: 'background 0.2s'
                    }}
                    className="header-icon-btn"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {/* Right: Notification Bar & Profile */}
            <div className="doc-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div ref={notificationRef} style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ 
                            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: showNotifications ? '#eff6ff' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                            cursor: 'pointer', color: showNotifications ? '#2563eb' : '#64748b', position: 'relative', transition: 'all 0.2s' 
                        }}
                    >
                        <Icons.Bell />
                        <span style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }}></span>
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '320px',
                            background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden',
                            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>Recent Alerts</span>
                                <span style={{ padding: '2px 8px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '900', borderRadius: '4px' }}>3</span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.map(n => (
                                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{n.title}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{n.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Link */}
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
                    onClick={onNavigateToProfile}
                >
                    <div className="desktop-only" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>Dr. {user?.name?.split(' ')[0] || 'Provider'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Active</div>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <img 
                            src={user?.avatar || "/doctor_avatar_default_1776170000144.png"} 
                            alt="Doctor" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
