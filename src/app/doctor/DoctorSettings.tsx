import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';
import Preloader from '../../components/Preloader';

const Icons = {
    User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Globe: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    Camera: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    CreditCard: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Heart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    MessageSquare: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
};

export default function DoctorSettings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        specialty: '',
        experience_years: '',
        bio: '',
        city: '',
        state: '',
        consultation_type: 'both',
        consultation_duration: 30
    });

    const [toggles, setToggles] = useState({
        emailNotif: true,
        smsNotif: true,
        pushNotif: true,
        appointmentReminders: true,
        marketing: false,
        twoFactor: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/doctor/settings');
            const { user, doctor } = response.data;
            setFormData({
                name: user.name || '',
                email: user.email || '',
                specialty: doctor?.specialty || '',
                experience_years: doctor?.experience_years || '',
                bio: doctor?.bio || '',
                city: doctor?.city || '',
                state: doctor?.state || '',
                consultation_type: doctor?.consultation_type || 'both',
                consultation_duration: doctor?.consultation_duration || 30
            });
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile/password', passwordData);
            toast.success("Password updated successfully");
            setShowPasswordModal(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error: any) {
            console.error("Failed to update password", error);
            const message = error.response?.data?.message || "Failed to update password";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/doctor/settings', formData);
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Failed to update settings", error);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Public Profile', icon: <Icons.User /> },
        { id: 'practice', label: 'Practice Details', icon: <Icons.Home /> },
        { id: 'security', label: 'Security & Login', icon: <Icons.Lock /> },
        { id: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
    ];

    if (loading) return <Preloader />;

    return (
        <div className="doc-content-area animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Password Update Modal */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="settings-card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Update Password</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Create a strong password to protect your account.</p>
                        </div>

                        <form onSubmit={handlePasswordUpdate}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="settings-input-group">
                                    <label className="settings-label">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="settings-input-group">
                                    <label className="settings-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password_confirmation}
                                        onChange={e => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="btn-secondary-light"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="settings-btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="settings-header">
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Settings</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Manage your profile and account preferences.</p>
            </div>

            {/* Horizontal Tabs - Duplicated from Patient */}
            <div className="settings-tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    {/* Public Profile Section */}
                    {activeTab === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="settings-card">
                                <h3 className="settings-section-title">Profile Photo</h3>
                                <p className="settings-section-desc" style={{ marginBottom: '24px' }}>This photo will be displayed on your public profile.</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                                        </div>
                                        <button type="button" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#2563eb', color: 'white', border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <div style={{ transform: 'scale(0.7)' }}><Icons.Camera /></div>
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="btn-secondary-light" style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '6px' }}>Change Photo</button>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>JPG, PNG or GIF. Max 2MB.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div>
                                        <h3 className="settings-section-title">Public Information</h3>
                                        <p className="settings-section-desc">Details visible to patients on the platform.</p>
                                    </div>
                                    <button type="submit" disabled={saving} className="settings-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Specialty</label>
                                        <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Years of Experience</label>
                                        <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Email (Display Only)</label>
                                        <input type="email" value={formData.email} disabled className="settings-input" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="settings-input-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="settings-label">Professional Bio</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="settings-input" style={{ minHeight: '100px', resize: 'vertical' }} />
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Practice Details */}
                    {activeTab === 'practice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="settings-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div>
                                        <h3 className="settings-section-title">Consultation Preferences</h3>
                                        <p className="settings-section-desc">Manage how you conduct your appointments.</p>
                                    </div>
                                    <button type="submit" disabled={saving} className="settings-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Consultation Type</label>
                                        <select name="consultation_type" value={formData.consultation_type} onChange={handleInputChange} className="settings-input">
                                            <option value="both">Both (Virtual & Physical)</option>
                                            <option value="virtual">Virtual Only</option>
                                            <option value="physical">Physical Only</option>
                                        </select>
                                    </div>
                                    <div className="settings-input-group">
                                        <label className="settings-label">Session Duration (minutes)</label>
                                        <input type="number" name="consultation_duration" value={formData.consultation_duration} onChange={handleInputChange} className="settings-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3 className="settings-section-title">Availability Settings</h3>
                                <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Your availability is managed in the Schedule module.</p>
                                <button type="button" className="btn-secondary-light">Go to Schedule</button>
                            </div>
                        </div>
                    )}

                    {/* Security & Login */}
                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="settings-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
                                    <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Password & Authentication</h3>
                                </div>
                                <p className="settings-section-desc" style={{ marginBottom: '24px' }}>Keep your account secure with a strong password and 2FA.</p>

                                <div className="settings-item-row" style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Password</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Change your account password</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(true)}
                                        className="settings-btn-primary"
                                        style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        Update
                                    </button>
                                </div>

                                <div className="settings-item-row">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Two-Factor Authentication (2FA)</div>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #dbeafe' }}>Recommended</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Ask for OTP via SMS for every login.</div>
                                    </div>
                                    <div className={`toggle-switch-lg ${toggles.twoFactor ? 'active' : ''}`} onClick={() => handleToggle('twoFactor')} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="settings-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                    <div style={{ color: '#2563eb' }}><Icons.Bell /></div>
                                    <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Notification Preferences</h3>
                                </div>

                                <div className="settings-item-row" style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ color: '#64748b' }}><Icons.Mail /></div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Email Notifications</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Receive appointment updates via email</div>
                                        </div>
                                    </div>
                                    <div className={`toggle-switch-lg ${toggles.emailNotif ? 'active' : ''}`} onClick={() => handleToggle('emailNotif')} />
                                </div>

                                <div className="settings-item-row">
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ color: '#64748b' }}><Icons.MessageSquare /></div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>SMS Notifications</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Get urgent alerts via text message</div>
                                        </div>
                                    </div>
                                    <div className={`toggle-switch-lg ${toggles.smsNotif ? 'active' : ''}`} onClick={() => handleToggle('smsNotif')} />
                                </div>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}
