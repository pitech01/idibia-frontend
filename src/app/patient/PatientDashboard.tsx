import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services'; // Import api
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
import Preloader from '../../components/Preloader.tsx';
import './patient.css';

interface DashboardProps {
    onLogout: () => void;
}

const Icons = {
    Phone: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
};

export default function PatientDashboard({ onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop state
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user');
                setUser(response.data);
            } catch (error) {
                // console.error("Failed to fetch user", error);
                // Silently fail or redirect to login if 401
            } finally {
                // Determine a minimum loading time for better UX if needed, or just set false
                setTimeout(() => setLoading(false), 1000); // 1s delay for smoother experience
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar Overlay (Mobile) */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar Component */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <main className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                {/* Header Component */}
                <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {/* Dashboard View */}
                <div className="content-scrollable">
                    {activeTab === 'dashboard' && <DashboardHome onNavigate={setActiveTab} user={user} loading={loading} />}
                    {activeTab === 'appointments' && <Appointments onRequestNewBooking={() => setActiveTab('new-booking')} onNavigateToMessages={() => setActiveTab('messages')} />}
                    {activeTab === 'new-booking' && <NewBooking onBack={() => setActiveTab('appointments')} />}
                    {activeTab === 'payment' && <PatientPayments />}
                    {activeTab === 'records' && <MedicalRecords onUploadRecord={() => setActiveTab('upload-record')} />}
                    {activeTab === 'upload-record' && <UploadRecord onBack={() => setActiveTab('records')} />}
                    {activeTab === 'resources' && <Resources />}
                    {activeTab === 'messages' && <Messages user={user} />}

                    {activeTab === 'settings' && <Settings />}

                    {/* Placeholder for future modules if any */}
                    {[''].includes(activeTab) && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                            <p>This feature is coming soon.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button - Emergency Call */}
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
                            setActiveTab('settings');
                        }
                    }}
                >
                    <Icons.Phone />
                </button>
            )}
        </div>
    );
}
