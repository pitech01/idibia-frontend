import { useState, useRef, useEffect } from 'react';
import { api } from '../../services';


interface DoctorHeaderProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
    user?: any;
    activeTab?: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    ChevronDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    Settings: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    LogOut: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

export default function DoctorHeader({ user, activeTab, setActiveTab, onLogout }: DoctorHeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLButtonElement>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const sortedNotifications = response.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setNotifications(sortedNotifications);
            const unread = sortedNotifications.filter((n: any) => !n.read_at).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

            <div className="doc-header-actions" style={{ gap: '24px' }}>


                <div style={{ position: 'relative' }}>
                    <button
                        ref={notificationRef}
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', position: 'relative' }}
                        title="Notifications"
                    >
                        <Icons.Bell />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            width: '320px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e2e8f0',
                            zIndex: 50,
                            padding: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>Notifications</h4>
                                {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {notifications.length > 0 ? (
                                    notifications.slice(0, 5).map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.read_at && markAsRead(notification.id)}
                                            style={{
                                                padding: '10px',
                                                background: notification.read_at ? 'white' : '#f0f9ff',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                border: notification.read_at ? '1px solid white' : '1px solid #e0f2fe',
                                                cursor: notification.read_at ? 'default' : 'pointer'
                                            }}
                                        >
                                            <p style={{ margin: 0, color: '#334155', fontWeight: notification.read_at ? '400' : '600' }}>
                                                {notification.data?.message || notification.data?.title || 'New Notification'}
                                            </p>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px' }}>No notifications</p>
                                )}
                            </div>

                            {notifications.length > 5 && (
                                <div style={{ marginTop: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer' }}>View All</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Classic Profile - No Pill Background */}
                <div
                    ref={profileRef}
                    style={{ position: 'relative' }}
                >
                    <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                        <img src={user?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"} alt="Doctor" className="doc-avatar" />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Dr. {user?.name || 'User'}</span>
                            {/* Role often omitted in dense classic headers, or kept small */}
                        </div>
                        <span style={{ color: '#94a3b8' }}><Icons.ChevronDown /></span>
                    </div>

                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            width: '200px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #e2e8f0',
                            zIndex: 50,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Dr. {user?.name}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{user?.email}</p>
                            </div>
                            <div style={{ padding: '4px' }}>
                                <button
                                    onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                >
                                    <Icons.User /> Profile
                                </button>
                                <button
                                    onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                >
                                    <Icons.Settings /> Settings
                                </button>
                            </div>
                            <div style={{ padding: '4px', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                >
                                    <Icons.LogOut /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
