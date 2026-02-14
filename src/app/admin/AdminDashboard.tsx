import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api, WEB_URL } from '../../services';
import { toast } from 'react-hot-toast';
import FilePreview from '../../components/FilePreview';
import CreatePostModal from './CreatePostModal';
import {
    LayoutDashboard, Users, UserRound, Calendar, CreditCard,
    Megaphone, MessageSquare, Settings, LogOut, Search,
    Eye, Trash2, Edit, AlertCircle, CheckCircle, XCircle,
    MapPin, Droplet, FileText, UserCircle,
    ChevronLeft, ChevronRight, Download
} from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'consultations' | 'payments' | 'updates' | 'settings' | 'support'>('overview');
    const [stats, setStats] = useState({ doctors: 0, updates: 0, tickets: 0, patients: 0 });
    const [doctors, setDoctors] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [pricingFee, setPricingFee] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [patientGenderFilter, setPatientGenderFilter] = useState('');
    const [patientBloodFilter, setPatientBloodFilter] = useState('');
    const [patientCurrentPage, setPatientCurrentPage] = useState(1);
    const [patientItemsPerPage] = useState(10);
    const [previewFile, setPreviewFile] = useState<{ url: string, name: string } | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [managePost, setManagePost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDoctor.doctor) {
            setPricingFee(selectedDoctor.doctor.consultation_fee || '0');
        }
    }, [selectedDoctor]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [docsRes, postsRes, ticketsRes, patientsRes] = await Promise.allSettled([
                api.get('/doctors'),
                api.get('/posts'),
                api.get('/support'),
                api.get('/admin/patients')
            ]);

            let docCount = 0;
            let postCount = 0;
            let ticketCount = 0;
            let patientCount = 0;

            if (docsRes.status === 'fulfilled') {
                setDoctors(docsRes.value.data);
                docCount = docsRes.value.data.length;
            }
            if (postsRes.status === 'fulfilled') {
                setUpdates(postsRes.value.data);
                postCount = postsRes.value.data.length;
            }
            if (ticketsRes.status === 'fulfilled') {
                setTickets(ticketsRes.value.data);
                ticketCount = ticketsRes.value.data.filter((t: any) => t.status === 'open').length;
            }
            if (patientsRes.status === 'fulfilled') {
                setPatients(patientsRes.value.data);
                patientCount = patientsRes.value.data.length;
            }

            setStats({ doctors: docCount, updates: postCount, tickets: ticketCount, patients: patientCount });
        } catch (error) {
            console.error("Failed to load admin data", error);
            toast.error("Some data could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to construct file URL
    const getFileUrl = (path: string) => {
        if (!path) return '';
        // If path is already a full URL, return it
        if (path.startsWith('http')) return path;

        // Remove 'public/' prefix if present in the stored path (common in Laravel)
        const cleanPath = path.replace(/^public\//, '');

        // Ensure no double slashes when joining
        const baseUrl = WEB_URL.endsWith('/') ? WEB_URL.slice(0, -1) : WEB_URL;
        return `${baseUrl}/storage/${cleanPath}`;
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // ignore
        }
        onLogout();
    };

    const handleDeletePost = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/admin/posts/${id}`);
            toast.success('Post deleted');
            fetchData();
        } catch (e) {
            toast.error('Failed to delete post');
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !replyMessage.trim()) return;

        const toastId = toast.loading('Sending reply...');
        try {
            await api.post(`/support/${selectedTicket.id}/reply`, { message: replyMessage });
            toast.success('Reply sent', { id: toastId });
            setReplyMessage('');
            // Refresh detailed view
            const res = await api.get(`/support/${selectedTicket.id}`);
            setSelectedTicket(res.data);
            fetchData(); // Update list count
        } catch (e) {
            toast.error('Failed to send reply', { id: toastId });
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/support/${id}/status`, { status });
            toast.success(`Ticket marked as ${status}`);
            if (selectedTicket && selectedTicket.id === id) {
                const res = await api.get(`/support/${id}`);
                setSelectedTicket(res.data);
            }
            fetchData();
        } catch (e) {
            toast.error('Failed to update status');
        }
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

    const exportPatientsToCSV = () => {
        if (patients.length === 0) return;
        const headers = ['Name', 'Email', 'Phone', 'Gender', 'DOB', 'Blood Group', 'City', 'State', 'Conditions', 'Joined'];
        const csvRows = [
            headers.join(','),
            ...patients.map(p => [
                `"${p.name}"`,
                `"${p.email}"`,
                `"${p.patient?.phone || ''}"`,
                `"${p.patient?.gender || ''}"`,
                `"${p.patient?.dob || ''}"`,
                `"${p.patient?.blood_group || ''}"`,
                `"${p.patient?.city || ''}"`,
                `"${p.patient?.state || ''}"`,
                `"${(p.patient?.conditions || '').replace(/"/g, '""')}"`,
                `"${new Date(p.created_at).toLocaleDateString()}"`
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `idibia_patients_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="admin-layout" style={{ display: 'flex', height: '100vh', background: '#f1f5f9' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', background: '#0f172a', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-brand" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>DIBIA ADMIN</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Management Portal</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <SidebarItem id="overview" label="Dashboard" icon={<LayoutDashboard size={20} />} />
                    <SidebarItem id="doctors" label="Doctors" icon={<Users size={20} />} />
                    <SidebarItem id="patients" label="Patients" icon={<UserRound size={20} />} />
                    <SidebarItem id="consultations" label="Consultations" icon={<Calendar size={20} />} />
                    <SidebarItem id="payments" label="Transactions" icon={<CreditCard size={20} />} />
                    <SidebarItem id="updates" label="Health Updates" icon={<Megaphone size={20} />} />
                    <SidebarItem id="support" label="Support Messages" icon={<MessageSquare size={20} />} />
                    <SidebarItem id="settings" label="Settings" icon={<Settings size={20} />} />
                </nav>

                <button onClick={handleLogout} style={{
                    marginTop: 'auto', background: '#ef4444', color: 'white', border: 'none',
                    padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <LogOut size={20} /> Logout
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
                                    <StatCard title="Total Doctors" value={stats.doctors} color="#3b82f6" icon={<Users size={24} />} />
                                    <StatCard title="Total Patients" value={stats.patients} color="#8b5cf6" icon={<UserRound size={24} />} />
                                    <StatCard title="Health Updates" value={stats.updates} color="#10b981" icon={<Megaphone size={24} />} />
                                    <StatCard title="Open Support Tickets" value={stats.tickets} color="#e11d48" icon={<MessageSquare size={24} />} />
                                </div>
                            )}

                            {activeTab === 'doctors' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    {/* Pending Approvals Section */}
                                    <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <AlertCircle size={20} /> Pending Approvals
                                        </h3>
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
                                                                    onClick={() => setSelectedDoctor(doc)}
                                                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                                                >
                                                                    View Application
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
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Action</th>
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
                                                                    background: status === 'active' || isVerified ? '#dcfce7' : status === 'pending_approval' ? '#fff7ed' : '#fee2e2',
                                                                    color: status === 'active' || isVerified ? '#166534' : status === 'pending_approval' ? '#c2410c' : '#991b1b',
                                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize'
                                                                }}>
                                                                    {status === 'pending_approval' ? 'Pending' : status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>
                                                                <button
                                                                    onClick={() => setSelectedDoctor(doc)}
                                                                    style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <Eye size={14} /> View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {doctors.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No doctors found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'updates' && (
                                <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3>Health Updates & Articles</h3>
                                        <button
                                            onClick={() => {
                                                setManagePost(null);
                                                setShowPostModal(true);
                                            }}
                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Megaphone size={18} /> Create Health Update
                                        </button>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {updates.map(post => (
                                            <div key={post.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{post.title} {post.is_featured ? '⭐' : ''}</h4>
                                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                                        {new Date(post.created_at).toLocaleDateString()} • {post.category} • {post.author_name}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setManagePost(post);
                                                            setShowPostModal(true);
                                                        }}
                                                        style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {updates.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No updates available.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h3>Support Inquiries</h3>
                                    <div style={{ marginTop: '20px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>User</th>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>Subject</th>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>Priority</th>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>Status</th>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>Date</th>
                                                    <th style={{ padding: '12px', color: '#64748b' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tickets.map(ticket => (
                                                    <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px', fontWeight: '500' }}>{ticket.user?.name}</td>
                                                        <td style={{ padding: '12px' }}>{ticket.subject}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{
                                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
                                                                background: ticket.priority === 'high' ? '#fecaca' : ticket.priority === 'medium' ? '#fed7aa' : '#e2e8f0',
                                                                color: ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#9a3412' : '#475569'
                                                            }}>{ticket.priority}</span>
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{
                                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
                                                                background: ticket.status === 'open' ? '#dbeafe' : ticket.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                                                                color: ticket.status === 'open' ? '#1e40af' : ticket.status === 'resolved' ? '#166534' : '#64748b'
                                                            }}>{ticket.status}</span>
                                                        </td>
                                                        <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            <button
                                                                onClick={async () => {
                                                                    const res = await api.get(`/support/${ticket.id}`);
                                                                    setSelectedTicket(res.data);
                                                                }}
                                                                style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <MessageSquare size={14} /> Open
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {tickets.length === 0 && <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No support tickets found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'patients' && (() => {
                                // Filtering logic
                                const filteredPatients = patients.filter(p => {
                                    const matchesSearch = !patientSearch || (
                                        p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                                        p.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                                        p.patient?.phone?.includes(patientSearch)
                                    );
                                    const matchesGender = !patientGenderFilter || p.patient?.gender === patientGenderFilter;
                                    const matchesBlood = !patientBloodFilter || p.patient?.blood_group === patientBloodFilter;
                                    return matchesSearch && matchesGender && matchesBlood;
                                });

                                // Pagination logic
                                const totalPages = Math.ceil(filteredPatients.length / patientItemsPerPage);
                                const startIndex = (patientCurrentPage - 1) * patientItemsPerPage;
                                const paginatedPatients = filteredPatients.slice(startIndex, startIndex + patientItemsPerPage);

                                return (
                                    <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                            <h3 style={{ margin: 0 }}>Patient Directory <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>({filteredPatients.length} total)</span></h3>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={exportPatientsToCSV}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
                                                >
                                                    <Download size={16} /> Export CSV
                                                </button>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search patients..."
                                                        value={patientSearch}
                                                        onChange={(e) => {
                                                            setPatientSearch(e.target.value);
                                                            setPatientCurrentPage(1);
                                                        }}
                                                        style={{
                                                            padding: '8px 12px 8px 35px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0',
                                                            fontSize: '14px',
                                                            width: '200px',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                                        <Search size={16} />
                                                    </span>
                                                </div>
                                                <select
                                                    value={patientGenderFilter}
                                                    onChange={(e) => { setPatientGenderFilter(e.target.value); setPatientCurrentPage(1); }}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#64748b' }}
                                                >
                                                    <option value="">All Genders</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <select
                                                    value={patientBloodFilter}
                                                    onChange={(e) => { setPatientBloodFilter(e.target.value); setPatientCurrentPage(1); }}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#64748b' }}
                                                >
                                                    <option value="">All Blood Types</option>
                                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Patient</th>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Contact</th>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Location</th>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Health Profile</th>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Joined</th>
                                                        <th style={{ padding: '12px', color: '#64748b' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedPatients.map(p => (
                                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '12px' }}>
                                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gender: {p.patient?.gender || 'N/A'} • DOB: {p.patient?.dob || 'N/A'}</div>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>
                                                                <div style={{ fontSize: '14px' }}>{p.email}</div>
                                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{p.patient?.phone || 'No phone'}</div>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>
                                                                <div style={{ fontSize: '13px' }}>{p.patient?.city || 'N/A'}, {p.patient?.state || 'N/A'}</div>
                                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.patient?.country || 'Nigeria'}</div>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>
                                                                <div style={{ fontSize: '12px' }}>
                                                                    <span style={{ fontWeight: '500' }}>Blood:</span> {p.patient?.blood_group || 'N/A'}
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: '#ef4444' }}>
                                                                    {p.patient?.conditions ? `Cond: ${p.patient.conditions}` : ''}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>
                                                                {new Date(p.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td style={{ padding: '12px' }}>
                                                                <button
                                                                    onClick={() => setSelectedPatient(p)}
                                                                    style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <Eye size={14} /> Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {paginatedPatients.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                                No patients found matching your criteria.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                                <div style={{ fontSize: '14px', color: '#64748b' }}>
                                                    Showing {startIndex + 1} to {Math.min(startIndex + patientItemsPerPage, filteredPatients.length)} of {filteredPatients.length} entries
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        disabled={patientCurrentPage === 1}
                                                        onClick={() => setPatientCurrentPage(p => p - 1)}
                                                        style={{
                                                            padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white',
                                                            cursor: patientCurrentPage === 1 ? 'not-allowed' : 'pointer', opacity: patientCurrentPage === 1 ? 0.5 : 1,
                                                            display: 'flex', alignItems: 'center'
                                                        }}
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    {[...Array(totalPages)].map((_, i) => {
                                                        const page = i + 1;
                                                        // Show limited page numbers if too many
                                                        if (totalPages > 7 && Math.abs(page - patientCurrentPage) > 2 && page !== 1 && page !== totalPages) return null;
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => setPatientCurrentPage(page)}
                                                                style={{
                                                                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                                                    background: patientCurrentPage === page ? '#3b82f6' : 'white',
                                                                    color: patientCurrentPage === page ? 'white' : '#1e293b',
                                                                    cursor: 'pointer', fontSize: '14px', fontWeight: patientCurrentPage === page ? '600' : 'normal'
                                                                }}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        disabled={patientCurrentPage === totalPages}
                                                        onClick={() => setPatientCurrentPage(p => p + 1)}
                                                        style={{
                                                            padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white',
                                                            cursor: patientCurrentPage === totalPages ? 'not-allowed' : 'pointer', opacity: patientCurrentPage === totalPages ? 0.5 : 1,
                                                            display: 'flex', alignItems: 'center'
                                                        }}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {(activeTab === 'consultations' || activeTab === 'payments') && (
                                <EmptyState
                                    title={
                                        activeTab === 'consultations' ? 'Consultation Management' : 'Transaction History'
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

                {/* Doctor Details Modal */}
                {selectedDoctor && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '30px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                        }}>
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                &times;
                            </button>

                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                                Doctor Application Details
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                <div>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Personal Info</h3>
                                    <p><strong>Name:</strong> {selectedDoctor.name}</p>
                                    <p><strong>Email:</strong> {selectedDoctor.email}</p>
                                    {/* <p><strong>Phone:</strong> {selectedDoctor.phone || 'N/A'}</p> */}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Professional</h3>
                                    <p><strong>Specialty:</strong> {selectedDoctor.doctor?.specialty}</p>
                                    <p><strong>Experience:</strong> {selectedDoctor.doctor?.experience_years} Years</p>
                                    <p><strong>License #:</strong> {selectedDoctor.doctor?.license_number}</p>
                                    <p><strong>Authority:</strong> {selectedDoctor.doctor?.issuing_authority}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Practice Details</h3>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <p><strong>Workplace:</strong> {selectedDoctor.doctor?.workplace_name} ({selectedDoctor.doctor?.practice_type})</p>
                                    <p><strong>Location:</strong> {selectedDoctor.doctor?.city}, {selectedDoctor.doctor?.state}</p>
                                    <p><strong>Consultation:</strong> {selectedDoctor.doctor?.consultation_type}</p>
                                    {selectedDoctor.doctor?.bio && (
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                            <strong>Bio:</strong>
                                            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '5px' }}>{selectedDoctor.doctor.bio}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Verification Documents</h3>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div
                                        onClick={() => setPreviewFile({
                                            url: getFileUrl(selectedDoctor.doctor.license_document_path),
                                            name: 'Medical License'
                                        })}
                                        style={{
                                            flex: 1, padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px',
                                            cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px',
                                            background: selectedDoctor.doctor?.license_document_path ? 'white' : '#f1f5f9',
                                            pointerEvents: selectedDoctor.doctor?.license_document_path ? 'auto' : 'none',
                                            opacity: selectedDoctor.doctor?.license_document_path ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0284c7', display: 'flex' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Medical License</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Click to Preview</div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPreviewFile({
                                            url: getFileUrl(selectedDoctor.doctor.id_document_path),
                                            name: 'Government ID'
                                        })}
                                        style={{
                                            flex: 1, padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px',
                                            cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px',
                                            background: selectedDoctor.doctor?.id_document_path ? 'white' : '#f1f5f9',
                                            pointerEvents: selectedDoctor.doctor?.id_document_path ? 'auto' : 'none',
                                            opacity: selectedDoctor.doctor?.id_document_path ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '6px', color: '#d97706', display: 'flex' }}>
                                            <UserCircle size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Govt. ID</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Click to Preview</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Consultation Pricing</h3>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Consultation Fee (₦)</label>
                                        <input
                                            type="number"
                                            value={pricingFee}
                                            onChange={(e) => setPricingFee(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const toastId = toast.loading('Updating price...');
                                            try {
                                                await api.put(`/admin/doctors/${selectedDoctor.doctor.id}/pricing`, { consultation_fee: pricingFee });
                                                toast.success('Pricing updated!', { id: toastId });
                                                fetchData();
                                            } catch (error: any) {
                                                console.error(error);
                                                toast.error('Failed to update pricing', { id: toastId });
                                            }
                                        }}
                                        style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '18px' }}
                                    >
                                        Save Fee
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                {selectedDoctor.doctor?.status === 'pending_approval' ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Are you sure you want to approve this doctor?')) return;
                                                const toastId = toast.loading('Approving...');
                                                try {
                                                    await api.put(`/admin/doctors/${selectedDoctor.doctor.id}/approve`);
                                                    toast.success('Doctor Approved Successfully!', { id: toastId });
                                                    setSelectedDoctor(null);
                                                    fetchData();
                                                } catch (e: any) {
                                                    toast.error(e.response?.data?.message || 'Approval Failed', { id: toastId });
                                                }
                                            }}
                                            style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <CheckCircle size={20} /> Approve Application
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Are you sure you want to reject this doctor?')) return;
                                                const toastId = toast.loading('Rejecting...');
                                                try {
                                                    await api.put(`/admin/doctors/${selectedDoctor.doctor.id}/reject`);
                                                    toast.success('Doctor Rejected.', { id: toastId });
                                                    setSelectedDoctor(null);
                                                    fetchData();
                                                } catch (e: any) {
                                                    toast.error(e.response?.data?.message || 'Rejection Failed', { id: toastId });
                                                }
                                            }}
                                            style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <XCircle size={20} /> Reject Application
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', color: '#64748b', borderRadius: '8px' }}>
                                        This doctor is currently <strong>{selectedDoctor.doctor?.status}</strong>.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )
                }

                {/* Patient Details Modal */}
                {selectedPatient && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '30px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                        }}>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                &times;
                            </button>

                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                                Patient Profile Details
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                <div>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserCircle size={18} /> Basic Information
                                    </h3>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><strong>Name:</strong> {selectedPatient.name}</p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><strong>Email:</strong> {selectedPatient.email}</p>
                                    <p><strong>Gender:</strong> {selectedPatient.patient?.gender || 'N/A'}</p>
                                    <p><strong>DOB:</strong> {selectedPatient.patient?.dob || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedPatient.patient?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Droplet size={18} /> Health Profile
                                    </h3>
                                    <p><strong>Blood Group:</strong> {selectedPatient.patient?.blood_group || 'N/A'}</p>
                                    <p><strong>Genotype:</strong> {selectedPatient.patient?.genotype || 'N/A'}</p>
                                    <p><strong>Known Allergies:</strong> {selectedPatient.patient?.allergies || 'None listed'}</p>
                                    <p><strong>Chronic Conditions:</strong> {selectedPatient.patient?.conditions || 'None listed'}</p>
                                    <p style={{ color: '#ef4444' }}><strong>Emergency Contact:</strong> {selectedPatient.patient?.emergency_name} ({selectedPatient.patient?.emergency_phone})</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} /> Contact & Location
                                </h3>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <p><strong>Address:</strong> {selectedPatient.patient?.address || 'N/A'}</p>
                                    <p><strong>City/State:</strong> {selectedPatient.patient?.city}, {selectedPatient.patient?.state}</p>
                                    <p><strong>Country:</strong> {selectedPatient.patient?.country || 'Nigeria'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => {
                                        toast.error("User management features are currently read-only.");
                                    }}
                                    style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Deactivate Account
                                </button>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )
                }

                {/* Ticket Details Modal */}
                {selectedTicket && createPortal(
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
                    }}>
                        <div style={{
                            background: 'white', width: '90%', maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                        }}>
                            {/* Modal Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedTicket.subject}</h3>
                                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: '#e2e8f0', color: '#64748b' }}>#{selectedTicket.id}</span>
                                    </div>
                                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                                        By {selectedTicket.user?.name} via {selectedTicket.category || 'Support'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f1f5f9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Messages */}
                                    {selectedTicket.messages && selectedTicket.messages.map((msg: any) => {
                                        const isStaff = msg.user_id !== selectedTicket.user_id; // Simple check, ideally check role
                                        return (
                                            <div key={msg.id} style={{
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: isStaff ? 'flex-end' : 'flex-start',
                                            }}>
                                                <div style={{
                                                    maxWidth: '80%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    background: isStaff ? '#3b82f6' : 'white',
                                                    color: isStaff ? 'white' : '#334155',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    borderBottomRightRadius: isStaff ? '2px' : '12px',
                                                    borderBottomLeftRadius: isStaff ? '12px' : '2px'
                                                }}>
                                                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.message}</div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                                                    {isStaff ? 'Admin' : selectedTicket.user?.name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                                {selectedTicket.status === 'closed' ? (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                                        This ticket is closed. <button onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>Reopen</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <textarea
                                                value={replyMessage}
                                                onChange={e => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply..."
                                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', height: '50px', outline: 'none', fontFamily: 'inherit' }}
                                                required
                                            />
                                            <button type="submit" style={{ padding: '0 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                                Send
                                            </button>
                                        </div>
                                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                Status: <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{selectedTicket.status.replace('_', ' ')}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {selectedTicket.status !== 'closed' && (
                                                    <button type="button" onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')} style={{ fontSize: '12px', color: '#ef4444', border: '1px solid #fecaca', background: '#fef2f2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                        Close Ticket
                                                    </button>
                                                )}
                                                {selectedTicket.status !== 'resolved' && (
                                                    <button type="button" onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')} style={{ fontSize: '12px', color: '#16a34a', border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* File Preview Modal */}
                {
                    previewFile && (
                        <FilePreview
                            fileUrl={previewFile.url}
                            fileName={previewFile.name}
                            onClose={() => setPreviewFile(null)}
                        />
                    )
                }

                {/* Create/Edit Post Modal */}
                {showPostModal && (
                    <CreatePostModal
                        post={managePost}
                        onClose={() => setShowPostModal(false)}
                        onSuccess={() => {
                            fetchData();
                        }}
                    />
                )}
            </main >
        </div >
    );
}

function StatCard({ title, value, sub, color, icon }: any) {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
                {sub && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>{sub}</div>}
            </div>
            <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '10px', display: 'flex' }}>
                {icon}
            </div>
        </div>
    );
}

function EmptyState({ title, message }: any) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#cbd5e1', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <AlertCircle size={48} />
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>{title}</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>{message}</p>
        </div>
    );
}
