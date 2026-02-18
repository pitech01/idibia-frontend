import { useState, useEffect } from 'react';
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
import './doctor.css';

interface DoctorDashboardProps {
    onLogout: () => void;
}

export default function DoctorDashboard({ onLogout }: DoctorDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setTimeout(() => setLoading(false), 1000);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="doc-layout">
            <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

            <main className="doc-main">
                <DoctorHeader user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

                {activeTab === 'overview' && <DoctorOverview setActiveTab={setActiveTab} />}
                {activeTab === 'schedule' && <DoctorSchedule />}
                {activeTab === 'patients' && <DoctorPatients setActiveTab={setActiveTab} />}
                {activeTab === 'messages' && <DoctorMessages />}
                {activeTab === 'support' && <DoctorSupport />}
                {activeTab === 'settings' && <DoctorSettings />}
                {activeTab === 'earnings' && <DoctorEarnings />}

                {activeTab !== 'overview' && activeTab !== 'schedule' && activeTab !== 'patients' && activeTab !== 'messages' && activeTab !== 'support' && activeTab !== 'settings' && activeTab !== 'earnings' && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
                        <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <h2 style={{ marginTop: 16 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                        <p>Coming Soon</p>
                    </div>
                )}
            </main>
        </div>
    );
}
