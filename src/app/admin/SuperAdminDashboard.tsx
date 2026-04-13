import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api } from '../../services';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, Users, Shield, Server, Settings,
    LogOut, Plus, Activity,
    Database, Cpu, Globe, Search, UserMinus, Clock,
    Coins, ArrowUpCircle, Edit3, ArrowUpRight, ArrowDownRight, History
} from 'lucide-react';

interface SuperAdminDashboardProps {
    onLogout: () => void;
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [systemStats, setSystemStats] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [showGlobalCreditModal, setShowGlobalCreditModal] = useState(false);
    const [globalCreditDelta, setGlobalCreditDelta] = useState({ amount: '', type: 'add' });
    const [creditHistory, setCreditHistory] = useState<any[]>([]);

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/super-admin/dashboard/users')) return 'users';
        if (path.includes('/super-admin/dashboard/credits')) return 'credits';
        if (path.includes('/super-admin/dashboard/system')) return 'system';
        if (path.includes('/super-admin/dashboard/settings')) return 'settings';
        return 'overview';
    };

    const activeTab = getActiveTab();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, historyRes] = await Promise.all([
                api.get('/super-admin/system-stats'),
                api.get('/super-admin/users'),
                api.get('/super-admin/credit-transactions')
            ]);
            setSystemStats(statsRes.data);
            setAllUsers(usersRes.data);
            setCreditHistory(historyRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to sync with root authority.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const tid = toast.loading('Deploying administrative unit...');
        try {
            await api.post('/super-admin/admins', adminFormData);
            toast.success('Admin deployed successfully', { id: tid });
            setShowAddAdmin(false);
            setAdminFormData({ name: '', email: '', password: '', role: 'admin' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Deployment aborted', { id: tid });
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('DANGER: Permanent data removal and access revocation. Proceed?')) return;
        try {
            await api.delete(`/super-admin/users/${id}`);
            toast.success('Entity purged from system.');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Purge failed');
        }
    };

    const handleUpdateGlobalPool = async (e: React.FormEvent) => {
        e.preventDefault();
        const tid = toast.loading('Synchronizing universal credit pool...');
        try {
            await api.post('/super-admin/update-global-pool', {
                amount: globalCreditDelta.amount || 0,
                type: globalCreditDelta.type
            });
            toast.success('Universal credit infrastructure updated.', { id: tid });
            setShowGlobalCreditModal(false);
            setGlobalCreditDelta({ amount: '', type: 'add' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed', { id: tid });
        }
    };

    const SidebarItem = ({ id, icon, label, path }: { id: string, icon: any, label: string, path: string }) => (
        <button
            className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => navigate(path)}
            style={{ 
                color: activeTab === id ? '#f59e0b' : '#94a3b8',
                background: activeTab === id ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                borderLeftColor: activeTab === id ? '#f59e0b' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 24px', border: 'none', cursor: 'pointer', transition: '0.2s', fontSize: '15px'
            }}
        >
            {icon} {label}
        </button>
    );

    if (loading) {
        return (
            <div style={{ height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f59e0b' }}>
                <Activity size={48} className="animate-pulse" />
                <p style={{ marginTop: '20px', fontWeight: 'bold', letterSpacing: '4px' }}>ESTABLISHING ENCRYPTED LINK...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: '#020617', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ padding: '30px', borderBottom: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield color="#f59e0b" fill="#f59e0b" fillOpacity={0.2} size={28} />
                        <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>DIBIA <span style={{ color: '#f59e0b' }}>ROOT</span></span>
                    </div>
                </div>

                <nav style={{ padding: '20px 0', flex: 1 }}>
                    <SidebarItem id="overview" label="Operational Overview" icon={<LayoutDashboard size={18} />} path="/super-admin/dashboard" />
                    <SidebarItem id="users" label="Universal Auth" icon={<Users size={18} />} path="/super-admin/dashboard/users" />
                    <SidebarItem id="credits" label="Global Economy" icon={<Coins size={18} />} path="/super-admin/dashboard/credits" />
                    <SidebarItem id="system" label="System Vitals" icon={<Server size={18} />} path="/super-admin/dashboard/system" />
                    <SidebarItem id="settings" label="Root Configuration" icon={<Settings size={18} />} path="/super-admin/dashboard/settings" />
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
                    <button 
                        onClick={() => { api.post('/logout').finally(() => onLogout()); }} 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'transparent', border: '1px solid #1e293b', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <LogOut size={18} /> Kill Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <header style={{ background: 'white', padding: '20px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px' }}>
                            {activeTab === 'overview' ? 'Root Terminal' : 
                             activeTab === 'users' ? 'Authority Management' : 
                             activeTab === 'credits' ? 'Economic Oversight' : 
                             activeTab}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', fontWeight: '800' }}>CLEARANCE: ROOT</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Protocol Secure v4.2</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>Root Administrator</div>
                            <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Online
                            </div>
                        </div>
                        <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.3)' }}>SA</div>
                    </div>
                </header>

                <div style={{ padding: '40px' }}>
                    <Routes>
                        <Route path="/" element={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* User Breakdown Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                    {[
                                        { label: 'Total Entities', count: systemStats?.total_users, color: '#f59e0b', icon: <Users size={20} /> },
                                        { label: 'Universal Credits', count: systemStats?.global_credits?.toFixed(1), color: '#10b981', icon: <Coins size={20} /> },
                                        { label: 'Root Admins', count: systemStats?.super_admins, color: '#8b5cf6', icon: <Shield size={20} /> },
                                        { label: 'Live Sessions', count: systemStats?.active_sessions, color: '#3b82f6', icon: <Activity size={20} /> }
                                    ].map((stat, i) => (
                                        <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderBottom: `4px solid ${stat.color}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{stat.label}</span>
                                                <div style={{ color: stat.color }}>{stat.icon}</div>
                                            </div>
                                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>{stat.count}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Operational Vitals */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                                    <div style={{ background: '#0f172a', color: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px', color: '#f59e0b' }}>System Infrastructure</h3>
                                            <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#94a3b8' }}>Uptime: 99.9%</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                                            {[
                                                { label: 'ORCHESTRATOR', value: `Laravel v${systemStats?.laravel_version}`, icon: <Database size={16} /> },
                                                { label: 'RUNTIME ENVIRONMENT', value: `PHP v${systemStats?.php_version}`, icon: <Cpu size={16} /> },
                                                { label: 'HOST OPERATING SYSTEM', value: systemStats?.server_os, icon: <Globe size={16} /> }
                                            ].map((vit, i) => (
                                                <div key={i}>
                                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>{vit.label}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#f8fafc' }}>
                                                        {vit.icon} {vit.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Security Events</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {[
                                                { msg: 'Global access synchronization successful', time: '2m ago', type: 'success' },
                                                { msg: 'Route /api/super-admin/users accessed', time: '5m ago', type: 'info' },
                                                { msg: 'New admin deployment initiated', time: '1h ago', type: 'warning' }
                                            ].map((evt, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid #f8fafc' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: evt.type === 'success' ? '#10b981' : evt.type === 'info' ? '#3b82f6' : '#f59e0b' }}></div>
                                                    <div style={{ flex: 1, fontSize: '13px', color: '#475569' }}>{evt.msg}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{evt.time}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } />

                        <Route path="/credits" element={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* Global Status Card */}
                                <div style={{ background: '#020617', borderRadius: '32px', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                                            <Coins size={24} />
                                            <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>UNIVERSAL SHARED POOL</span>
                                        </div>
                                        <div style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-2px' }}>
                                            {systemStats?.global_credits?.toLocaleString()} <span style={{ fontSize: '20px', color: '#94a3b8', fontWeight: '400' }}>Units</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>Capacity Status: <span style={{ color: systemStats?.global_credits > 100 ? '#10b981' : '#ef4444' }}>{systemStats?.global_credits > 100 ? 'STABLE' : 'CRITICAL'}</span></div>
                                    </div>
                                    <button 
                                        onClick={() => setShowGlobalCreditModal(true)}
                                        style={{ background: '#10b981', border: 'none', padding: '18px 32px', borderRadius: '16px', fontWeight: '900', fontSize: '15px', color: '#020617', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    >
                                        <ArrowUpCircle size={20} /> RECHARGE INFRASTRUCTURE
                                    </button>
                                </div>

                                {/* Transactions Ledger */}
                                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ padding: '24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><History size={18} /> Global Economic Ledger</h3>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Latest 100 Activities</span>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>TIMESTAMP</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>ORIGIN / ENTITY</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>TYPE</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>DELTA</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>JUSTIFICATION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {creditHistory.map((tx, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '20px', fontSize: '13px', color: '#94a3b8' }}>{new Date(tx.created_at).toLocaleString()}</td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>{tx.user?.name.charAt(0)}</div>
                                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{tx.user?.name || 'System Auto'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '10px', background: tx.type === 'consume' ? '#fff1f2' : '#f0fdf4', color: tx.type === 'consume' ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: parseFloat(tx.amount) < 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            {parseFloat(tx.amount) < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                            {Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '20px', fontSize: '13px', color: '#475569' }}>{tx.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        } />

                        <Route path="/users" element={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Advanced Filters */}
                                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search authority or identity (name/email)..." 
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                            style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select 
                                            value={roleFilter}
                                            onChange={e => setRoleFilter(e.target.value)}
                                            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', minWidth: '160px' }}
                                        >
                                            <option value="">All Roles</option>
                                            <option value="patient">Patients</option>
                                            <option value="doctor">Doctors</option>
                                            <option value="nurse">Nurses</option>
                                            <option value="admin">Admins</option>
                                            <option value="super-admin">Root Admins</option>
                                        </select>
                                        <button 
                                            onClick={() => setShowAddAdmin(true)}
                                            style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
                                        >
                                            <Plus size={18} /> Admin Deployment
                                        </button>
                                    </div>
                                </div>

                                {/* User Registry */}
                                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>IDENTITY UNIT</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>AUTHORIZATION</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>REGISTRATION</th>
                                                <th style={{ padding: '20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                                        <Search size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                                        <div>No matching entities found in the universal auth registry.</div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map(user => (
                                                    <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '20px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{user.name}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '20px' }}>
                                                            <span style={{ 
                                                                fontSize: '10px', fontWeight: '800', padding: '5px 12px', borderRadius: '20px', 
                                                                background: 
                                                                    user.role === 'super-admin' ? '#fef2f2' : 
                                                                    user.role === 'admin' ? '#eff6ff' : 
                                                                    user.role === 'doctor' ? '#f0fdf4' : '#f8fafc', 
                                                                color: 
                                                                    user.role === 'super-admin' ? '#ef4444' : 
                                                                    user.role === 'admin' ? '#3b82f6' : 
                                                                    user.role === 'doctor' ? '#10b981' : '#64748b', 
                                                                textTransform: 'uppercase' 
                                                            }}>
                                                                {user.role.replace('-', ' ')}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '20px' }}>
                                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Clock size={14} color="#94a3b8" /> {new Date(user.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '20px' }}>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <button 
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    style={{ background: '#fff1f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: '0.2s' }}
                                                                    title="Revoke Permission"
                                                                >
                                                                    <UserMinus size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/super-admin/dashboard" />} />
                    </Routes>
                </div>
            </main>

            {/* Add Admin Modal */}
            {showAddAdmin && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ background: 'white', borderRadius: '32px', width: '500px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield color="#d97706" size={24} />
                            </div>
                            <h2 style={{ margin: 0, color: '#0f172a' }}>Admin Deployment</h2>
                        </div>
                        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Assign new administrative privileges. This action will be logged in the root audit trail.</p>
                        
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>FULL NAME</label>
                                    <input 
                                        type="text" required 
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                        value={adminFormData.name}
                                        onChange={e => setAdminFormData({...adminFormData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>EMAIL</label>
                                    <input 
                                        type="email" required 
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                        value={adminFormData.email}
                                        onChange={e => setAdminFormData({...adminFormData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>SECURE KEY (PASSWORD)</label>
                                <input 
                                    type="password" required 
                                    style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                    value={adminFormData.password}
                                    onChange={e => setAdminFormData({...adminFormData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>AUTHORIZATION LEVEL</label>
                                <select 
                                    style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                    value={adminFormData.role}
                                    onChange={e => setAdminFormData({...adminFormData, role: e.target.value})}
                                >
                                    <option value="admin">Administrator Staff</option>
                                    <option value="super-admin">Root Authority</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowAddAdmin(false)} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Initialize Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Global Credit Management Modal */}
            {showGlobalCreditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ background: 'white', borderRadius: '32px', width: '450px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Coins color="#10b981" size={24} />
                            </div>
                            <h2 style={{ margin: 0, color: '#0f172a' }}>Global Pool Mgmt</h2>
                        </div>
                        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px' }}>Managing the universal shared credit pool. Current: <strong>{systemStats?.global_credits?.toFixed(2)}</strong></p>
                        
                        <form onSubmit={handleUpdateGlobalPool} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>ACTION TYPE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[
                                        { id: 'add', label: 'Recharge', icon: <Plus size={14} /> },
                                        { id: 'set', label: 'Set Precise', icon: <Edit3 size={14} /> },
                                        { id: 'reset', label: 'Emergency Kill', icon: <Shield size={14} /> }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setGlobalCreditDelta({ ...globalCreditDelta, type: type.id })}
                                            style={{
                                                padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0',
                                                background: globalCreditDelta.type === type.id ? '#0f172a' : 'white',
                                                color: globalCreditDelta.type === type.id ? 'white' : '#475569',
                                                fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer'
                                            }}
                                        >
                                            {type.icon} {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {globalCreditDelta.type !== 'reset' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>AMOUNT (UNITS)</label>
                                    <input 
                                        type="number" step="0.01" required 
                                        placeholder="e.g. 5000.00"
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                        value={globalCreditDelta.amount}
                                        onChange={e => setGlobalCreditDelta({...globalCreditDelta, amount: e.target.value})}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowGlobalCreditModal(false)} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Update Global Pool</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
