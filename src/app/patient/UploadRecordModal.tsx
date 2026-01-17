import { useState } from 'react';

const Icons = {
    X: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Sparkles: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Calendar: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

interface UploadRecordModalProps {
    onClose: () => void;
}

export default function UploadRecordModal({ onClose }: UploadRecordModalProps) {
    const [dragActive, setDragActive] = useState(false);

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
        // Handle file upload logic here
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
            padding: '20px', overflowY: 'auto'
        }}>
            <div className="animate-fade-in" style={{
                background: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Digitize a Record</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <Icons.X />
                    </button>
                </div>

                <div style={{ padding: '0 32px 32px 32px', overflowY: 'auto' }}>

                    {/* AI Notice */}
                    <div style={{
                        background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px',
                        padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0
                        }}>
                            <Icons.Sparkles />
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                            <strong style={{ color: '#0f172a' }}>AI Auto-Scan enabled:</strong> We will try to read the doctor’s handwriting for you
                        </p>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragActive ? '#0ea5e9' : '#cbd5e1'}`,
                            background: dragActive ? '#f0f9ff' : '#f8fafc',
                            borderRadius: '16px',
                            minHeight: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginBottom: '24px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#64748b'
                        }}>
                            <Icons.Upload />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>Drag and drop or Click to Scan</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Supports PDF, JPG, PNG (Max 10MB)</div>
                        </div>
                    </div>

                    {/* Simple Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Record Type</label>
                            <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', outline: 'none' }}>
                                <option>Select type</option>
                                <option>Lab Result</option>
                                <option>Prescription</option>
                                <option>Clinical Note</option>
                                <option>Scan/X-Ray</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}><Icons.Calendar /></span>
                                <input type="text" placeholder="Select date" style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Doctor Name</label>
                            <input type="text" placeholder="e.g., Dr. Bala Okeke" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155' }} />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                        <button style={{ padding: '10px 24px', borderRadius: '8px', background: '#7dd3fc', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(125, 211, 252, 0.4)' }}>Upload Record</button>
                        {/* Note: In screenshot the primary button color is a lighter blue/cyan, so I used #7dd3fc to match the 'Upload Record' button in image which looks lighter than the usual #0284c7 */}
                    </div>

                </div>
            </div>
        </div>
    );
}
