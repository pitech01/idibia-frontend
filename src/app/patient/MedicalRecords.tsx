import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    Flask: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Link: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    FileText: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Scan: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l5.293 5.293a1 1 0 01-1.414 1.414L4 6.414V9a1 1 0 01-2 0V4zm12 0a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-2 0V6.414l-5.293 5.293a1 1 0 01-1.414-1.414L17.586 4H15a1 1 0 01-1-1zm-2 12a1 1 0 011-1h3.586l-5.293 5.293a1 1 0 01-1.414-1.414L11.586 17H9a1 1 0 01-1-1v-4a1 1 0 012 0v2.586l4.293-4.293a1 1 0 011.414 1.414L11.414 16H15z" /></svg>,
    Upload: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Download: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Pill: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Clock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    CalendarSmall: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    UserSmall: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    ChevronRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    Image: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Eye: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Loading: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
};

interface MedicalRecordsProps {
    onUploadRecord: () => void;
}

interface MedicalRecord {
    id: number;
    type: string;
    title: string;
    description?: string;
    file_path?: string;
    doctor_name?: string;
    record_date: string;
    status: string;
    facility?: string;
    file_url?: string;
}

export default function MedicalRecords({ onUploadRecord }: MedicalRecordsProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Lab Result');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'Lab Result', label: 'Lab Results', icon: <Icons.Flask /> },
        { id: 'Prescription', label: 'Prescriptions', icon: <Icons.Link /> },
        { id: 'Clinical Note', label: 'Clinical Notes', icon: <Icons.FileText /> },
        { id: 'Scan/X-Ray', label: 'Scans/X-Rays', icon: <Icons.Scan /> },
    ];

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const { data } = await api.get('/medical-records');
            setRecords(data);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || error.message || 'Failed to load medical records';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r => r.type === activeTab);

    const handleFileOpen = (url?: string) => {
        if (url) {
            setPreviewUrl(url);
        } else {
            toast.error('No file attached to this record');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'abnormal': return { color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2' };
            case 'normal': return { color: '#16a34a', border: '1px solid #bbf7d0', background: '#f0fdf4' };
            case 'pending': return { color: '#4b5563', border: '1px solid #e5e7eb', background: '#f9fafb' };
            case 'active': return { color: '#2563eb', border: '1px solid #dbeafe', background: '#eff6ff' };
            case 'completed': return { color: '#059669', border: '1px solid #a7f3d0', background: '#ecfdf5' };
            case 'discontinued': return { color: '#9ca3af', border: '1px solid #e5e7eb', background: '#f3f4f6' };
            default: return { color: '#4b5563', border: '1px solid #e5e7eb', background: '#f9fafb' };
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Medical Records</h2>
                <button
                    onClick={onUploadRecord}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: 'white', color: '#0f172a', fontWeight: '600', cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    <Icons.Upload /> Upload Record
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '24px',
                            border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                            background: activeTab === tab.id ? '#2E37A4' : '#f1f5f9',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(46, 55, 164, 0.2)' : 'none'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Icons.Loading /></div>}

            {!loading && (
                <>
                    {/* Prescriptions Grid View */}
                    {activeTab === 'Prescription' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filteredRecords.length === 0 && <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No prescriptions found.</p>}
                            {filteredRecords.map(p => (
                                <div key={p.id} className="dash-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', transition: 'box-shadow 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: p.status === 'Active' ? '#eff6ff' : '#f3f4f6',
                                                color: p.status === 'Active' ? '#2563eb' : '#9ca3af',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Icons.Pill />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{p.title}</h3>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{p.description}</p>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '20px',
                                            ...getStatusStyle(p.status)
                                        }}>
                                            {p.status}
                                        </span>
                                    </div>

                                    <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                            <Icons.UserSmall /> <span>{p.doctor_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                                            <Icons.CalendarSmall /> <span>{new Date(p.record_date).toDateString()}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleFileOpen(p.file_url) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                            <Icons.Download />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Clinical Notes List View */}
                    {activeTab === 'Clinical Note' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredRecords.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No clinical notes found.</p>}
                            {filteredRecords.map(note => (
                                <div key={note.id} className="dash-card" style={{
                                    background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                    transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                            background: '#f0f9ff', color: '#0ea5e9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Icons.FileText />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{note.title}</h3>
                                            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5', maxWidth: '600px' }}>
                                                {note.description}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icons.UserSmall /> <span>{note.doctor_name}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icons.CalendarSmall /> <span>{new Date(note.record_date).toDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#cbd5e1' }}>
                                        <button onClick={(e) => { e.stopPropagation(); handleFileOpen(note.file_url) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                            <Icons.Download />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Scans Grid View */}
                    {activeTab === 'Scan/X-Ray' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {filteredRecords.length === 0 && <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No scans found.</p>}
                            {filteredRecords.map(scan => (
                                <div key={scan.id} className="dash-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{
                                        background: '#e0f2fe', borderRadius: '12px', height: '160px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#7dd3fc', marginBottom: '20px'
                                    }}>
                                        <Icons.Image />
                                    </div>

                                    <div style={{ marginBottom: '24px', flexGrow: 1 }}>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{scan.title}</h3>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>{scan.facility}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Icons.UserSmall /> <span>{scan.doctor_name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Icons.CalendarSmall /> <span>{new Date(scan.record_date).toDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleFileOpen(scan.file_url)}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white',
                                                color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                                            }}>
                                            <Icons.Eye /> View
                                        </button>
                                        <button
                                            onClick={() => handleFileOpen(scan.file_url)}
                                            style={{
                                                width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white',
                                                color: '#64748b', cursor: 'pointer'
                                            }}>
                                            <Icons.Download />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Table Card for Lab Results */}
                    {activeTab === 'Lab Result' && (
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                            {filteredRecords.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No lab results found.</p>}
                            {filteredRecords.length > 0 && <div className="table-responsive">
                                <table className="trans-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Name</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ordering Doctor</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map(r => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                                <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '14px' }}>{new Date(r.record_date).toLocaleDateString()}</td>
                                                <td style={{ padding: '20px 24px', color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>{r.title}</td>
                                                <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '14px' }}>{r.doctor_name}</td>
                                                <td style={{ padding: '20px 24px', color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{r.description}</td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{
                                                        ...getStatusStyle(r.status),
                                                        padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        {r.status === 'Abnormal' && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                                        {r.status === 'Normal' && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleFileOpen(r.file_url)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white',
                                                            color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                                    >
                                                        <Icons.Eye /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>}
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            {previewUrl && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px', backdropFilter: 'blur(4px)'
                }} onClick={() => setPreviewUrl(null)}>
                    <div style={{
                        background: 'white', borderRadius: '24px',
                        width: '100%', height: '100%', maxWidth: '1024px', maxHeight: '800px',
                        display: 'flex', flexDirection: 'column',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{
                            padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'white', zIndex: 10
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>File Preview</h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                style={{
                                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
                                }}
                            >
                                <Icons.Close />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', background: 'white' }} title="Preview"></iframe>
                            ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(previewUrl) ? (
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ marginBottom: '16px', color: '#64748b' }}>
                                        <Icons.FileText />
                                    </div>
                                    <p style={{ color: '#0f172a', fontWeight: '600', marginBottom: '8px' }}>Preview not available</p>
                                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>This file type cannot be previewed directly.</p>
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', background: '#2E37A4', color: 'white',
                                        textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px'
                                    }}>
                                        <Icons.Download /> Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
