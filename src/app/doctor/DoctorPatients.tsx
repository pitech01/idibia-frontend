import { useState } from 'react';

// Icons
const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Filter: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    More: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
    Chat: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    FileText: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    User: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Users: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
};

// Types
interface Patient {
    id: string;
    patientId: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    reason: string;
    lastVisit: string;
    nextAppointment: string;
    status: 'Active' | 'Follow-Up' | 'Completed';
    image: string;
}

export default function DoctorPatients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock Data
    const patients: Patient[] = [
        {
            id: '1',
            patientId: 'PT-2023-089',
            name: 'Sarah Johnson',
            age: 34,
            gender: 'Female',
            reason: 'Chronic Migraine',
            lastVisit: 'Oct 10, 2023',
            nextAppointment: 'Oct 24, 2023',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop'
        },
        {
            id: '2',
            patientId: 'PT-2023-104',
            name: 'Michael Chen',
            age: 45,
            gender: 'Male',
            reason: 'Hypertension',
            lastVisit: 'Sep 28, 2023',
            nextAppointment: 'Nov 15, 2023',
            status: 'Follow-Up',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop'
        },
        {
            id: '3',
            patientId: 'PT-2023-156',
            name: 'Amara Ndiaye',
            age: 28,
            gender: 'Female',
            reason: 'Dermatitis',
            lastVisit: 'Oct 05, 2023',
            nextAppointment: 'None',
            status: 'Completed',
            image: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=1780&auto=format&fit=crop'
        },
        {
            id: '4',
            patientId: 'PT-2023-112',
            name: 'James Wilson',
            age: 52,
            gender: 'Male',
            reason: 'Type 2 Diabetes',
            lastVisit: 'Oct 02, 2023',
            nextAppointment: 'Oct 30, 2023',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop'
        },
        {
            id: '5',
            patientId: 'PT-2023-201',
            name: 'Funke Adebayo',
            age: 61,
            gender: 'Female',
            reason: 'Arthritis',
            lastVisit: 'Sep 15, 2023',
            nextAppointment: 'Dec 01, 2023',
            status: 'Follow-Up',
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1740&auto=format&fit=crop'
        }
    ];

    // Filter Logic
    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'All' || patient.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return { bg: '#dbeafe', text: '#1e40af' };
            case 'Follow-Up': return { bg: '#fef3c7', text: '#92400e' };
            case 'Completed': return { bg: '#dcfce7', text: '#166534' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <div className="doc-content-area animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>My Patients</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>View and manage your assigned patients.</p>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{patients.length}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Total Assigned</div>
                    </div>
                    <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                            {patients.filter(p => p.status === 'Active').length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Active Cases</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="doc-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}><Icons.Search /></span>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="doc-input"
                        style={{ width: '100%', paddingLeft: '36px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {['All', 'Active', 'Follow-Up', 'Completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`doc-btn ${statusFilter === status ? 'doc-btn-primary' : 'doc-btn-secondary'}`}
                            style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                background: statusFilter === status ? '#2563eb' : 'white',
                                color: statusFilter === status ? 'white' : '#64748b',
                                border: statusFilter === status ? 'none' : '1px solid #e2e8f0',
                                boxShadow: 'none'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Patients Table */}
            <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Patient</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>ID / Demographics</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Consultation</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Visits</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={patient.image} alt={patient.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{patient.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{patient.patientId}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{patient.age} yrs • {patient.gender}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '14px', color: '#0f172a' }}>{patient.reason}</span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '13px', color: '#0f172a' }}>Last: {patient.lastVisit}</div>
                                    <div style={{ fontSize: '12px', color: patient.nextAppointment === 'None' ? '#94a3b8' : '#2563eb', fontWeight: patient.nextAppointment === 'None' ? '400' : '500' }}>
                                        Next: {patient.nextAppointment}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: getStatusColor(patient.status).bg,
                                        color: getStatusColor(patient.status).text
                                    }}>
                                        {patient.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button title="View Profile" style={{ padding: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#64748b' }}>
                                            <Icons.User />
                                        </button>
                                        <button title="View Records" style={{ padding: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#64748b' }}>
                                            <Icons.FileText />
                                        </button>
                                        <button title="Chat" style={{ padding: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#2563eb' }}>
                                            <Icons.Chat />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <Icons.Users />
                                        <p>No patients found matching your search.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
