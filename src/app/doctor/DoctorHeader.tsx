import { useState } from 'react';

interface DoctorHeaderProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
    user?: any;
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
}

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    ChevronDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    Settings: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

export default function DoctorHeader({ user, activeTab, setActiveTab }: DoctorHeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, title: 'New Appointment', desc: 'Patient John Doe booked a session', time: '5m ago' },
        { id: 2, title: 'Prescription Ready', desc: 'Pharmacy confirmed the request', time: '2h ago' },
        { id: 3, title: 'Payment Received', desc: '₦15,000 added to your wallet', time: '1d ago' },
    ];

    return (
        <header className="doc-header">
            {/* Left side usually has search or title in classic layout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Breadcrumb - Subtle */}
                <div className="doc-breadcrumbs">
                    <span style={{ color: '#94a3b8', fontWeight: '400' }}>Dashboard</span>
                    <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
                    <span style={{ textTransform: 'capitalize' }}>{activeTab || 'Overview'}</span>
                </div>

                {/* Classic Search Bar */}
                <div style={{ position: 'relative', width: '320px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>
                        <Icons.Search />
                    </span>
                    <input
                        type="text"
                        placeholder="Search doctors, records..."
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0', // Very subtle border
                            background: '#f8fafc',
                            outline: 'none',
                            fontSize: '14px',
                            color: '#334155'
                        }}
                    />
                </div>
            </div>

            <div className="doc-header-actions" style={{ gap: '24px', position: 'relative' }}>
                <button 
                    onClick={() => setActiveTab?.('settings')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'settings' ? '#2563eb' : '#64748b', transition: 'color 0.2s' }}
                >
                    <Icons.Settings />
                </button>

                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: showNotifications ? '#2563eb' : '#64748b', position: 'relative', transition: 'color 0.2s' }}
                    >
                        <Icons.Bell />
                        <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '320px',
                            background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Notifications</span>
                                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer' }}>Mark all as read</button>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.map(n => (
                                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{n.title}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{n.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '12px', textAlign: 'center', background: '#f8fafc' }}>
                                <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Classic Profile - No Pill Background */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <img src={user?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"} alt="Doctor" className="doc-avatar" />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Dr. {user?.last_name || 'User'}</span>
                        {/* Role often omitted in dense classic headers, or kept small */}
                    </div>
                    <span style={{ color: '#94a3b8' }}><Icons.ChevronDown /></span>
                </div>
            </div>
        </header>
    );
}
