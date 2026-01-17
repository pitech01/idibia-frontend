import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    ArrowLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Sparkles: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Calendar: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Loading: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" /></svg>,
};

interface UploadRecordProps {
    onBack: () => void;
}

export default function UploadRecord({ onBack }: UploadRecordProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState('Lab Result');
    const [date, setDate] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!date || !doctorName || !type) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('type', type);
        formData.append('record_date', date);
        formData.append('doctor_name', doctorName);
        if (title) formData.append('title', title);
        if (file) formData.append('file', file);

        try {
            await api.post('/medical-records', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Record uploaded successfully');
            onBack();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Icons.ArrowLeft />
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Digitize a Record</h2>
            </div>

            {/* Content Card */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px', maxWidth: '800px' }}>

                {/* AI Notice */}
                <div style={{
                    background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '16px',
                    padding: '24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-start'
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E37A4',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0
                    }}>
                        <Icons.Sparkles />
                    </div>
                    <div>
                        <p style={{ fontSize: '15px', color: '#1e2894', margin: '0 0 4px 0', fontWeight: '700' }}>
                            AI Auto-Scan Enabled
                        </p>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                            We used advanced OCR to read the doctor’s handwriting for you. Just upload a picture of the prescription or lab result.
                        </p>
                    </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    style={{
                        border: `2px dashed ${dragActive ? '#2E37A4' : '#cbd5e1'}`,
                        background: dragActive ? '#eef2ff' : '#f8fafc',
                        borderRadius: '24px',
                        minHeight: '240px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginBottom: '32px',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                >
                    <input type="file" id="file-upload" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />

                    {!file ? (
                        <>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#64748b'
                            }}>
                                <Icons.Upload />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Drag and drop or Click to Scan</div>
                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Supports PDF, JPG, PNG (Max 10MB)</div>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#16a34a', margin: '0 auto 16px auto'
                            }}>
                                <Icons.Check />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{file.name}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ marginTop: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                        </div>
                    )}
                </div>

                {/* Simple Form */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Record Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', outline: 'none', fontSize: '15px' }}
                        >
                            <option value="Lab Result">Lab Result</option>
                            <option value="Prescription">Prescription</option>
                            <option value="Clinical Note">Clinical Note</option>
                            <option value="Scan/X-Ray">Scan/X-Ray</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Date</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }}><Icons.Calendar /></span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155', fontSize: '15px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Doctor Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Dr. Bala Okeke"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155', fontSize: '15px' }}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Title (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Malaria Test Results"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155', fontSize: '15px' }}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={onBack} disabled={loading} style={{ padding: '14px 32px', borderRadius: '12px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '14px 40px', borderRadius: '12px',
                            background: loading ? '#94a3b8' : '#2E37A4',
                            color: 'white', border: 'none', fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.4)',
                            fontSize: '15px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        {loading && <Icons.Loading />}
                        {loading ? 'Uploading...' : 'Upload Record'}
                    </button>
                </div>

            </div>
        </div>
    );
}
