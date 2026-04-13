import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api } from '../../services';
import DashboardHome from './DashboardHome.tsx';
import Appointments from './Appointments.tsx';
import PatientPayments from './PatientPayments.tsx';
import MedicalRecords from './MedicalRecords.tsx';
import UploadRecord from './UploadRecord.tsx';
import Resources from './Resources.tsx';
import Messages from './Messages.tsx';
import NewBooking from './NewBooking.tsx';
import Settings from './Settings.tsx';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import Support from './Support.tsx';
import Preloader from '../../components/Preloader.tsx';
import './patient.css';

interface DashboardProps {
    onLogout: () => void;
}

const Icons = {
    Phone: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
};

export default function PatientDashboard({ onLogout }: DashboardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active tab from URL path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/patient/dashboard/appointments')) return 'appointments';
        if (path.includes('/patient/dashboard/new-booking')) return 'new-booking';
        if (path.includes('/patient/dashboard/payments')) return 'payment';
        if (path.includes('/patient/dashboard/records')) return 'records';
        if (path.includes('/patient/dashboard/upload-record')) return 'upload-record';
        if (path.includes('/patient/dashboard/resources')) return 'resources';
        if (path.includes('/patient/dashboard/messages')) return 'messages';
        if (path.includes('/patient/dashboard/support')) return 'support';
        if (path.includes('/patient/dashboard/settings')) return 'settings';
        return 'dashboard';
    };

    const activeTab = getActiveTab();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle legacy query params from redirects (Paystack, verification, etc.)
        const params = new URLSearchParams(window.location.search);
        if (params.get('verify')) {
            navigate('/patient/dashboard/appointments' + window.location.search, { replace: true });
        } else if (params.get('reference')) {
            navigate('/patient/dashboard/payments' + window.location.search, { replace: true });
        }
    }, [location.search, navigate]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleTabChange = (tab: string) => {
        const routeMap: Record<string, string> = {
            'dashboard': '/patient/dashboard',
            'appointments': '/patient/dashboard/appointments',
            'new-booking': '/patient/dashboard/new-booking',
            'payment': '/patient/dashboard/payments',
            'records': '/patient/dashboard/records',
            'upload-record': '/patient/dashboard/upload-record',
            'resources': '/patient/dashboard/resources',
            'messages': '/patient/dashboard/messages',
            'support': '/patient/dashboard/support',
            'settings': '/patient/dashboard/settings'
        };
        navigate(routeMap[tab] || '/patient/dashboard');
    };

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="dashboard-container">
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onLogout={onLogout}
            />

            <main className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <div className="content-scrollable">
                    <Routes>
                        <Route path="/" element={<DashboardHome onNavigate={handleTabChange} user={user} loading={loading} />} />
                        <Route path="/appointments" element={<Appointments onRequestNewBooking={() => handleTabChange('new-booking')} onNavigateToMessages={() => handleTabChange('messages')} onRefresh={fetchUser} />} />
                        <Route path="/new-booking" element={<NewBooking user={user} onBack={() => handleTabChange('appointments')} onRefresh={fetchUser} />} />
                        <Route path="/payments" element={<PatientPayments />} />
                        <Route path="/records" element={<MedicalRecords onUploadRecord={() => handleTabChange('upload-record')} />} />
                        <Route path="/upload-record" element={<UploadRecord onBack={() => handleTabChange('records')} />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/messages" element={<Messages user={user} />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
                    </Routes>
                </div>
            </main>

            {activeTab !== 'messages' && (
                <button style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    transition: 'transform 0.2s'
                }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => {
                        const phone = user?.patient?.emergency_phone;
                        if (phone) {
                            window.location.href = `tel:${phone}`;
                        } else {
                            toast.error("No emergency contact set. Please update your profile.");
                            handleTabChange('settings');
                        }
                    }}
                >
                    <Icons.Phone />
                </button>
            )}
        </div>
    );
}
