import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar.tsx';
import DoctorHeader from './DoctorHeader.tsx';
import DoctorOverview from './DoctorOverview.tsx';
import DoctorSchedule from './DoctorSchedule.tsx';
import DoctorPatients from './DoctorPatients.tsx';
import DoctorMessages from './DoctorMessages.tsx';
import DoctorSupport from './DoctorSupport.tsx';
import DoctorSettings from './DoctorSettings.tsx';
import DoctorEarnings from './DoctorEarnings.tsx';
import Preloader from '../../components/Preloader.tsx';
import { api } from '../../services';
import { toast as _toast } from 'react-hot-toast';
import './doctor.css';

interface DoctorDashboardProps {
    onLogout: () => void;
}

export default function DoctorDashboard({ onLogout }: DoctorDashboardProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab from URL path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/doctor/dashboard/schedule')) return 'schedule';
        if (path.includes('/doctor/dashboard/patients')) return 'patients';
        if (path.includes('/doctor/dashboard/messages')) return 'messages';
        if (path.includes('/doctor/dashboard/support')) return 'support';
        if (path.includes('/doctor/dashboard/settings')) return 'settings';
        if (path.includes('/doctor/dashboard/earnings')) return 'earnings';
        return 'overview';
    };

    const activeTab = getActiveTab();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            const userData = response.data;
            setUser(userData);

            // Gatekeeping Logic
            if (userData.role !== 'doctor') {
                 navigate('/');
                 return;
            }
            
            const doctor = userData.doctor;
            const isVerified = doctor?.status === 'active' || doctor?.is_verified === true || doctor?.is_verified === 1 || doctor?.is_verified === '1';
            
            if (!doctor || !isVerified) {
                if (doctor?.status === 'rejected') {
                    _toast.error(<b>Your application has been rejected.</b>, { duration: 6000 });
                }
                navigate('/pending-dashboard');
                return;
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleTabChange = (tab: string) => {
        const routeMap: Record<string, string> = {
            'overview': '/doctor/dashboard',
            'schedule': '/doctor/dashboard/schedule',
            'patients': '/doctor/dashboard/patients',
            'messages': '/doctor/dashboard/messages',
            'support': '/doctor/dashboard/support',
            'settings': '/doctor/dashboard/settings',
            'earnings': '/doctor/dashboard/earnings'
        };
        navigate(routeMap[tab] || '/doctor/dashboard');
        
        // Auto-close sidebar on mobile after selecting a tab
        setSidebarOpen(false);
    };

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="doc-layout">
            {sidebarOpen && <div className="doc-overlay" onClick={() => setSidebarOpen(false)}></div>}
            
            <DoctorSidebar 
                user={user}
                activeTab={activeTab} 
                setActiveTab={handleTabChange} 
                onLogout={onLogout} 
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <main className="doc-main">
                <DoctorHeader 
                    user={user} 
                    activeTab={activeTab} 
                    setActiveTab={handleTabChange} 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onNavigateToProfile={() => handleTabChange('settings')}
                />

                <Routes>
                    <Route path="/" element={<DoctorOverview setActiveTab={handleTabChange} />} />
                    <Route path="/schedule" element={<DoctorSchedule />} />
                    <Route path="/patients" element={<DoctorPatients setActiveTab={handleTabChange} />} />
                    <Route path="/messages" element={<DoctorMessages />} />
                    <Route path="/support" element={<DoctorSupport />} />
                    <Route path="/settings" element={<DoctorSettings onUpdate={fetchUser} setActiveTab={handleTabChange} />} />
                    <Route path="/earnings" element={<DoctorEarnings />} />
                    <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
}
