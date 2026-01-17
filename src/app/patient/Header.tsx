import { useState, useEffect } from 'react';
import { api } from '../../services';

// Icons for Header
const Icons = {
    Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Calendar: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    FileText: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    CheckCircle: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    X: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface HeaderProps {
    user?: any;
    onToggleSidebar?: () => void;
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <Icons.Calendar />;
            case 'result': return <Icons.FileText />;
            default: return <Icons.CheckCircle />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'appointment': return { color: '#3b82f6', bg: '#eff6ff' };
            case 'result': return { color: '#10b981', bg: '#f0fdf4' };
            default: return { color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };


    return (
        <header className="dash-header" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-header-toggle"
                    onClick={onToggleSidebar}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                    <Icons.Menu />
                </button>

                <div className="header-search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '10px 16px', width: '400px', gap: '8px' }}>
                    <div style={{ color: '#94a3b8' }}><Icons.Search /></div>
                    <input
                        type="text"
                        placeholder="Search doctors, records..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#1e293b' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: showNotifications ? '#3b82f6' : '#64748b', transition: 'color 0.2s' }}
                    >
                        <Icons.Bell />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '1px solid white' }}></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="animate-fade-in notification-dropdown" style={{
                            position: 'absolute',
                            top: '40px',
                            right: '-80px', // Adjusted for mobile
                            width: '360px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f1f5f9',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Notifications</h3>
                                <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Mark all as read</button>
                            </div>

                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No notifications</div>
                                ) : (
                                    notifications.map(notif => {
                                        const { color, bg } = getColors(notif.data.type);
                                        return (
                                            <div key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                style={{
                                                    padding: '16px',
                                                    borderBottom: '1px solid #f8fafc',
                                                    display: 'flex',
                                                    gap: '16px',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                    background: notif.read_at ? 'white' : '#f0f9ff'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseOut={e => e.currentTarget.style.background = notif.read_at ? 'white' : '#f0f9ff'}
                                            >
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: bg, color: color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {getIcon(notif.data.type)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{notif.data.title}</span>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(notif.created_at)}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{notif.data.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9', background: '#fcfcfc' }}>
                                <button style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                                    View All History
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="header-user-info" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{user?.name || 'Loading...'}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Patient</span>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold' }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span>{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
