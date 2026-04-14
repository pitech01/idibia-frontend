import { useState, useEffect } from 'react';
import { toast as _toast } from 'react-hot-toast';
const toast: any = _toast;
import { api } from '../../services';

// Icons
const Icons = {
    User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    CreditCard: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Phone: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Camera: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Mobile: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Tablet: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Laptop: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Trash: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    LogOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    DownloadCloud: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Heart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Save: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    MessageSquare: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    MessageCircle: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Calendar: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Megaphone: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
    Moon: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    BuildingLibrary: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
};

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // User Profile State
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        blood_group: '',
        emergency_name: '',
        emergency_phone: '',
        emergency_relationship: '',
    });

    const [toggles, setToggles] = useState({
        emailNotif: true,
        smsNotif: true,
        pushNotif: true,
        marketing: false,
        appointmentReminders: true,
        promotionalEmails: false,
        twoFactor: true,
        privacyMode: false,
        quietHours: false
    });

    const tabs = [
        { id: 'profile', label: 'Profile Details', icon: <Icons.User /> },
        { id: 'security', label: 'Security & Login', icon: <Icons.Lock /> },
        { id: 'emergency', label: 'Emergency Contact', icon: <Icons.Phone /> },
        { id: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
        { id: 'payment', label: 'Payment Methods', icon: <Icons.CreditCard /> },
        { id: 'history', label: 'Transaction History', icon: <Icons.BuildingLibrary /> },
    ];

    useEffect(() => {
        fetchProfile();
        if (activeTab === 'payment') {
            fetchPaymentMethods();
        }
        if (activeTab === 'history') {
            fetchTransactions();
        }
    }, [activeTab]);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/payments');
            setTransactions(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const { data } = await api.get('/payment-methods');
            setPaymentMethods(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePaymentMethod = async (id: number) => {
        try {
            await api.delete(`/payment-methods/${id}`);
            toast.success('Payment method removed');
            fetchPaymentMethods();
        } catch (error) {
            toast.error('Failed to remove payment method');
        }
    };

    const handleSetDefaultPaymentMethod = async (id: number) => {
        try {
            await api.put(`/payment-methods/${id}/default`);
            toast.success('Default updated');
            fetchPaymentMethods();
        } catch (error) {
            toast.error('Failed to update default');
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile');
            const patient = data.patient || {};

            // Split name
            const names = data.name ? data.name.split(' ') : ['', ''];
            const firstName = names[0];
            const lastName = names.slice(1).join(' ');

            setProfile({
                first_name: firstName,
                last_name: lastName,
                email: data.email,
                phone: patient.phone || '',
                dob: patient.dob || '',
                gender: patient.gender || 'Male',
                address: patient.address || '',
                blood_group: patient.blood_group || 'O+',
                emergency_name: patient.emergency_name || '',
                emergency_phone: patient.emergency_phone || '',
                emergency_relationship: patient.emergency_relationship || 'Mother',
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/profile', profile);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div className="settings-header" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0' }}>Settings</h1>
                <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', lineHeight: '1.6' }}>Manage your account preferences, privacy, and personal details.</p>
            </div>

            {/* Horizontal Tabs */}
            <div className="settings-tabs-container" style={{ 
                display: 'flex', gap: isMobile ? '12px' : '16px', marginBottom: '32px', 
                overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' 
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        style={{ 
                            whiteSpace: 'nowrap', 
                            background: activeTab === tab.id ? '#2E37A4' : 'white',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            padding: isMobile ? '10px 16px' : '12px 24px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(46, 55, 164, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ maxWidth: '800px' }}>
                {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading profile...</div>}

                {/* Profile Details */}
                {!loading && activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0' }}>Profile Details</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Manage your personal information and preferences.</p>
                        </div>

                        {/* Profile Photo */}
                        <div className="settings-card">
                            <h3 className="settings-section-title">Profile Photo</h3>
                            <p className="settings-section-desc" style={{ marginBottom: '24px' }}>This photo will be visible to your healthcare providers.</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=random`}
                                        alt="Profile"
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <button style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        background: '#2563eb', color: 'white', border: '2px solid white',
                                        borderRadius: '50%', width: '28px', height: '28px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    }}>
                                        <div style={{ transform: 'scale(0.7)' }}><Icons.Camera /></div>
                                    </button>
                                </div>
                                <div>
                                    <button style={{
                                        padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px',
                                        background: 'white', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                        marginBottom: '6px'
                                    }}>
                                        Upload New Photo
                                    </button>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>JPG, PNG or GIF. Max 2MB.</div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="settings-card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: isMobile ? '20px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
                                <div>
                                    <h3 className="settings-section-title" style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Personal Information</h3>
                                    <p className="settings-section-desc" style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Your basic profile information.</p>
                                </div>
                                <button onClick={handleSaveProfile} disabled={saving} style={{
                                    padding: '10px 20px', borderRadius: '12px',
                                    background: saving ? '#f1f5f9' : '#2E37A4', color: 'white', fontWeight: '700', fontSize: '14px', cursor: saving ? 'wait' : 'pointer',
                                    border: 'none', width: isMobile ? '100%' : 'auto'
                                }}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>First Name</label>
                                    <input type="text" value={profile.first_name} onChange={e => handleInputChange('first_name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Last Name</label>
                                    <input type="text" value={profile.last_name} onChange={e => handleInputChange('last_name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Email Address</label>
                                    <input type="email" value={profile.email} onChange={e => handleInputChange('email', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                                    <input type="tel" value={profile.phone} onChange={e => handleInputChange('phone', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Date of Birth</label>
                                    <input type="date" value={profile.dob} onChange={e => handleInputChange('dob', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Gender</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} value={profile.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="settings-card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: isMobile ? '20px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <h3 className="settings-section-title" style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Medical Information</h3>
                            <p className="settings-section-desc" style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px' }}>Basic health information for emergency situations.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                                <div className="settings-input-group" style={{ maxWidth: isMobile ? '100%' : '100%' }}>
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Blood Type</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} value={profile.blood_group} onChange={e => handleInputChange('blood_group', e.target.value)}>
                                        <option value="O+">O+</option>
                                        <option value="A+">A+</option>
                                        <option value="B+">B+</option>
                                        <option value="AB+">AB+</option>
                                        <option value="O-">O-</option>
                                        <option value="A-">A-</option>
                                        <option value="B-">B-</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Address</label>
                                    <input type="text" value={profile.address} onChange={e => handleInputChange('address', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ marginTop: '32px', textAlign: 'right' }}>
                                <button onClick={handleSaveProfile} disabled={saving} style={{ 
                                    padding: '14px 28px', borderRadius: '14px', border: 'none', background: '#2E37A4', color: 'white', fontWeight: '800', cursor: 'pointer', width: isMobile ? '100%' : 'auto',
                                    boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.2)'
                                }}>
                                    {saving ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security & Login */}
                {!loading && activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Header */}
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Security Settings</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Manage your password and 2-Factor Authentication.</p>
                        </div>

                        {/* Password & Authentication */}
                        <div className="settings-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
                                <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Password & Authentication</h3>
                            </div>
                            <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Keep your account secure with a strong password and 2FA.</p>

                            <div style={{ marginBottom: '32px' }}>
                                <div className="settings-item-row" style={{ padding: '0', border: 'none', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Password</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Last changed 3 months ago</div>
                                    </div>
                                    <button className="settings-btn-primary" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', padding: '8px 16px', fontSize: '13px' }}>Update</button>
                                </div>

                                <div className="settings-item-row" style={{ padding: '0', border: 'none' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Two-Factor Authentication (2FA)</div>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #dbeafe' }}>Recommended</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>We will ask for an OTP via SMS for every new login.</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.twoFactor ? 'active' : ''}`}
                                        onClick={() => handleToggle('twoFactor')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="settings-card">
                            <h3 className="settings-section-title">Where you're logged in</h3>
                            <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Manage and review your active sessions.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {/* Current Session */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ color: '#64748b' }}><Icons.Laptop /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Chrome on Windows</div>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>This device</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Lagos, Nigeria • <span style={{ color: '#16a34a' }}>Active Now</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Emergency Contact */}
                {!loading && activeTab === 'emergency' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Emergency Contact</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Add trusted contacts who can be reached in case of medical emergencies.</p>
                        </div>

                        {/* Info Alert */}
                        <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px' }}>
                            <div style={{ color: '#2563eb', flexShrink: 0 }}>
                                <Icons.Heart />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>Why add an emergency contact?</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', lineHeight: '1.5' }}>
                                    In critical situations, your healthcare provider may need to contact someone on your behalf. Your emergency contact can also receive your live location during ambulance dispatch.
                                </p>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="settings-card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: isMobile ? '20px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{profile.emergency_name || 'No contact added'}</h3>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2E37A4', background: '#eff6ff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #dbeafe', textTransform: 'uppercase' }}>{profile.emergency_relationship}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{profile.emergency_phone}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Full Name</label>
                                    <input type="text" value={profile.emergency_name} onChange={e => handleInputChange('emergency_name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Relationship</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} value={profile.emergency_relationship} onChange={e => handleInputChange('emergency_relationship', e.target.value)}>
                                        <option value="Mother">Mother</option>
                                        <option value="Father">Father</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Friend">Friend</option>
                                    </select>
                                </div>
                                <div className="settings-input-group" style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                                    <label className="settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                                    <input type="tel" value={profile.emergency_phone} onChange={e => handleInputChange('emergency_phone', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ background: '#f0f9ff', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', marginBottom: '32px', border: '1px solid #bae6fd' }}>
                                <div style={{ paddingTop: '2px' }}>
                                    <div style={{ width: '20px', height: '20px', background: '#0ea5e9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                </div>
                                <div>
                                    <h5 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0369a1' }}>Live Location Sharing</h5>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#0ea5e9', fontWeight: '500', lineHeight: '1.5' }}>This contact will receive your live location during ambulance dispatch or medical emergencies.</p>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <button onClick={handleSaveProfile} disabled={saving} style={{ 
                                    padding: '14px 28px', borderRadius: '14px', border: 'none', background: '#2E37A4', color: 'white', fontWeight: '800', cursor: 'pointer', width: isMobile ? '100%' : 'auto',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.2)'
                                }}>
                                    <Icons.Save /> {saving ? 'Saving...' : 'Save Contact Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Notification Preferences</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Choose how and when you want to receive updates from iDibia.</p>
                        </div>

                        {/* Communication Channels */}
                        <div className="settings-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ color: '#2563eb' }}><Icons.Bell /></div>
                                <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Communication Channels</h3>
                            </div>
                            <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Select how you want to receive notifications.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {/* Email Notifications */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Icons.Mail />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Email Notifications</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Receive updates and alerts via email</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.emailNotif ? 'active' : ''}`}
                                        onClick={() => handleToggle('emailNotif')}
                                    />
                                </div>

                                {/* SMS Notifications */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Icons.MessageSquare />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>SMS Notifications</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Get important alerts via text message</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.smsNotif ? 'active' : ''}`}
                                        onClick={() => handleToggle('smsNotif')}
                                    />
                                </div>

                                {/* Push Notifications */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Icons.MessageCircle />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Push Notifications</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Receive real-time notifications on your device</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.pushNotif ? 'active' : ''}`}
                                        onClick={() => handleToggle('pushNotif')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* What to notify you about */}
                        <div className="settings-card">
                            <h3 className="settings-section-title">What to notify you about</h3>
                            <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Customize which events trigger notifications.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {/* Appointment Reminders */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Icons.Calendar />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Appointment Reminders</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Reminders before your scheduled appointments</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.appointmentReminders ? 'active' : ''}`}
                                        onClick={() => handleToggle('appointmentReminders')}
                                    />
                                </div>

                                {/* Promotional Emails */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <Icons.Megaphone />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Promotional Emails</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Health tips, new features, and special offers</div>
                                    </div>
                                    <div
                                        className={`toggle-switch-lg ${toggles.promotionalEmails ? 'active' : ''}`}
                                        onClick={() => handleToggle('promotionalEmails')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quiet Hours */}
                        <div className="settings-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 className="settings-section-title" style={{ margin: 0 }}>Quiet Hours</h3>
                                    </div>
                                    <p className="settings-section-desc" style={{ margin: 0 }}>No notifications between 10:00 PM - 7:00 AM</p>
                                </div>
                                <div
                                    className={`toggle-switch-lg ${toggles.quietHours ? 'active' : ''}`}
                                    onClick={() => handleToggle('quietHours')}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Methods */}
                {activeTab === 'payment' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Payment Methods</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Manage your payment options for consultations and services.</p>
                        </div>

                        {/* Security Info */}
                        <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px' }}>
                            <div style={{ color: '#2563eb', flexShrink: 0 }}>
                                <Icons.Shield />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Your payment information is secure</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                    All payment data is encrypted and stored securely. We never store your full card number.
                                </p>
                            </div>
                        </div>

                        {/* Saved Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {paymentMethods.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0', color: '#64748b' }}>
                                    No saved payment methods yet. They will appear here after your first card payment.
                                </div>
                            ) : (
                                paymentMethods.map(method => (
                                    <div key={method.id} style={{
                                        padding: '20px', borderRadius: '16px', border: method.is_default ? '1.5px solid #2E37A4' : '1px solid #e2e8f0', background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
                                            <div style={{ width: '48px', height: '32px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', border: '1px solid #f1f5f9' }}>
                                                <Icons.CreditCard />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '4px' : '12px' }}>
                                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', textTransform: 'capitalize' }}>
                                                        {method.brand} •••• {method.last4}
                                                    </div>
                                                    {method.is_default && (
                                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#2E37A4', background: '#eff6ff', padding: '2px 8px', borderRadius: '60px', border: '1px solid #dbeafe', textTransform: 'uppercase' }}>Default</div>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>Expires {method.exp_month}/{method.exp_year}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!method.is_default && (
                                                <button 
                                                    onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                                    style={{ background: 'none', border: 'none', color: '#2E37A4', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '8px' }}
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDeletePaymentMethod(method.id)}
                                                style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Button */}
                        <button style={{
                            width: '100%', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '12px',
                            background: 'transparent', color: '#0f172a', fontWeight: '600', fontSize: '14px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s', marginTop: '8px'
                        }}
                            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Icons.Plus /> Add Payment Method
                        </button>

                             <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Transaction History</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>View all your past payments and receipts</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('history')}
                                style={{
                                    padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px',
                                    background: 'white', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                                }}
                            >
                                View History
                            </button>
                        </div>
                    </div>
                )}

                {/* Transaction History Content */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0' }}>Transaction History</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Track all your payments, top-ups, and refunds.</p>
                        </div>

                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            {transactions.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>💳</div>
                                    <p>No transactions found.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    {!isMobile ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Details</th>
                                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map(tx => (
                                                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '20px 24px' }}>
                                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{tx.description}</div>
                                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Ref: {tx.reference}</div>
                                                        </td>
                                                        <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b' }}>
                                                            {new Date(tx.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '20px 24px' }}>
                                                            <span style={{
                                                                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                                                                background: tx.status === 'success' ? '#f0fdf4' : tx.status === 'pending' ? '#fffbeb' : '#fef2f2',
                                                                color: tx.status === 'success' ? '#16a34a' : tx.status === 'pending' ? '#d97706' : '#ef4444'
                                                            }}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: '900', color: tx.type === 'debit' ? '#ef4444' : '#16a34a', textAlign: 'right' }}>
                                                            {tx.type === 'debit' ? '-' : '+'}₦{parseFloat(tx.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {transactions.map(tx => (
                                                <div key={tx.id} style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{tx.description}</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '900', color: tx.type === 'debit' ? '#ef4444' : '#16a34a' }}>
                                                            {tx.type === 'debit' ? '-' : '+'}₦{parseFloat(tx.amount).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                                            background: tx.status === 'success' ? '#f0fdf4' : tx.status === 'pending' ? '#fffbeb' : '#fef2f2',
                                                            color: tx.status === 'success' ? '#16a34a' : tx.status === 'pending' ? '#d97706' : '#ef4444'
                                                        }}>
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
