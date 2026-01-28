import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

interface AdminDashboardProps {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'consultations' | 'payments' | 'updates' | 'settings'>('overview');
    const [stats, setStats] = useState({ doctors: 0, updates: 0 });
    const [doctors, setDoctors] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [docsRes, postsRes] = await Promise.allSettled([
                api.get('/doctors'),
                api.get('/posts')
            ]);

            let docCount = 0;
            let postCount = 0;

            if (docsRes.status === 'fulfilled') {
                setDoctors(docsRes.value.data);
                docCount = docsRes.value.data.length;
            }
            if (postsRes.status === 'fulfilled') {
                setUpdates(postsRes.value.data);
                postCount = postsRes.value.data.length;
            }

            setStats({ doctors: docCount, updates: postCount });
        } catch (error) {
            console.error("Failed to load admin data", error);
            toast.error("Some data could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // ignore
        }
        onLogout();
    };

    const SidebarItem = ({ id, icon, label }: { id: string, icon: any, label: string }) => (
        <button
            className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id as any)}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px',
                background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', color: activeTab === id ? '#fff' : '#94a3b8',
                cursor: 'pointer', borderRadius: '8px', marginBottom: '5px',
                textAlign: 'left', fontSize: '0.95rem', transition: 'all 0.2s'
            }}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="admin-layout" style={{ display: 'flex', height: '100vh', background: '#f1f5f9' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', background: '#0f172a', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-brand" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>DIBIA ADMIN</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Management Portal</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <SidebarItem id="overview" label="Dashboard" icon={<span>📊</span>} />
                    <SidebarItem id="doctors" label="Doctors" icon={<span>👨‍⚕️</span>} />
                    <SidebarItem id="patients" label="Patients" icon={<span>👥</span>} />
                    <SidebarItem id="consultations" label="Consultations" icon={<span>📅</span>} />
                    <SidebarItem id="payments" label="Transactions" icon={<span>💳</span>} />
                    <SidebarItem id="updates" label="Health Updates" icon={<span>📢</span>} />
                    <SidebarItem id="settings" label="Settings" icon={<span>⚙️</span>} />
                </nav>

                <button onClick={handleLogout} style={{
                    marginTop: 'auto', background: '#ef4444', color: 'white', border: 'none',
                    padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <span>🚪</span> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <header style={{ background: 'white', padding: '20px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, textTransform: 'capitalize', color: '#1e293b' }}>{activeTab}</h2>
                    <div className="admin-profile">
                        <span style={{ fontWeight: '500', color: '#334155' }}>Administrator</span>
                    </div>
                </header>

                <div className="content-area" style={{ padding: '40px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading data...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                    <StatCard title="Total Doctors" value={stats.doctors} color="#3b82f6" />
                                    <StatCard title="Health Updates" value={stats.updates} color="#10b981" />
                                    <StatCard title="Active Patients" value="--" sub="Data not available" color="#64748b" />
                                    <StatCard title="Total Revenue" value="--" sub="Data not available" color="#f59e0b" />
                                </div>
                            )}

                            {activeTab === 'doctors' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    {/* Pending Approvals Section */}
                                    <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ color: '#d97706' }}>⚠️ Pending Approvals</h3>
                                        {doctors.filter(d => d.status === 'pending_approval' || (d.doctor && d.doctor.status === 'pending_approval')).length === 0 ? (
                                            <p style={{ color: '#94a3b8', marginTop: '10px' }}>No pending applications.</p>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                                                <thead>
                                                    <tr style={{ background: '#fff7ed', textAlign: 'left' }}>
                                                        <th style={{ padding: '12px', color: '#9a3412' }}>Name</th>
                                                        <th style={{ padding: '12px', color: '#9a3412' }}>Details</th>
                                                        <th style={{ padding: '12px', color: '#9a3412' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {doctors.filter(d => d.doctor && d.doctor.status === 'pending_approval').map(doc => (
                                                        <tr key={doc.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                                                            <td style={{ padding: '12px', color: '#334155' }}>
                                                                <div>{doc.name}</div>
                                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{doc.email}</div>
                                                            </td>
                                                            <td style={{ padding: '12px', color: '#334155' }}>
                                                                <div>{doc.doctor?.specialty || 'General'}</div>
                                                                <div style={{ fontSize: '12px' }}>{doc.doctor?.license_number}</div>
                                                            </td>
                                                            <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Approve this doctor?')) return;
                                                                        try {
                                                                            await api.put(`/admin/doctors/${doc.doctor.id}/approve`);
                                                                            toast.success('Doctor approved!');
                                                                            fetchData(); // Reload
                                                                        } catch (e) { toast.error('Action failed'); }
                                                                    }}
                                                                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Reject this doctor?')) return;
                                                                        try {
                                                                            await api.put(`/admin/doctors/${doc.doctor.id}/reject`);
                                                                            toast.success('Doctor rejected.');
                                                                            fetchData(); // Reload
                                                                        } catch (e) { toast.error('Action failed'); }
                                                                    }}
                                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {/* All Doctors List */}
                                    <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h3>Medical Professionals Directory</h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Name</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Specialty</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doctors.map(doc => {
                                                    // Handle mixed response types (from Users table or Doctors table)
                                                    const status = doc.doctor?.status || doc.status || 'Active';
                                                    const isVerified = doc.doctor?.is_verified || doc.is_verified;

                                                    return (
                                                        <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '12px', color: '#334155' }}>
                                                                {doc.name || doc.user?.name}
                                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{doc.email || doc.user?.email}</div>
                                                            </td>
                                                            <td style={{ padding: '12px', color: '#64748b' }}>{doc.specialty || doc.doctor?.specialty || 'N/A'}</td>
                                                            <td style={{ padding: '12px' }}>
                                                                <span style={{
                                                                    background: status === 'active' || isVerified ? '#dcfce7' : '#fee2e2',
                                                                    color: status === 'active' || isVerified ? '#166534' : '#991b1b',
                                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize'
                                                                }}>
                                                                    {status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {doctors.length === 0 && <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No doctors found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'updates' && (
                                <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3>Health Updates & Articles</h3>
                                        <button disabled style={{ background: '#e2e8f0', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'not-allowed' }}>
                                            + Create New (Pending Backend)
                                        </button>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {updates.map(post => (
                                            <div key={post.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{post.title}</h4>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                        {updates.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No updates available.</p>}
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'consultations' || activeTab === 'payments' || activeTab === 'patients') && (
                                <EmptyState
                                    title={
                                        activeTab === 'consultations' ? 'Consultation Management' :
                                            activeTab === 'patients' ? 'Patient Records' : 'Transaction History'
                                    }
                                    message="No records available. Global admin access for this module is currently pending backend support."
                                />
                            )}

                            {activeTab === 'settings' && (
                                <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '600px' }}>
                                    <h3>System Settings</h3>
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Maintenance Mode</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '20px', background: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
                                                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '1px', left: '1px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
                                                </div>
                                                <span style={{ color: '#64748b' }}>Disabled</span>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Support Contact Email</label>
                                            <input type="email" value="support@dibia.com" disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '30px' }}>Note: Settings are read-only in this version.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, sub, color }: any) {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>{sub}</div>}
        </div>
    );
}

function EmptyState({ title, message }: any) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
            <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>{title}</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>{message}</p>
        </div>
    );
}
