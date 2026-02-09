import { useState, useEffect } from 'react';

interface FilePreviewProps {
    fileUrl: string;
    fileName: string;
    fileType?: 'image' | 'pdf';
    onClose: () => void;
}

export default function FilePreview({ fileUrl, fileName, fileType, onClose }: FilePreviewProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Better type detection: check explicit type, or infer from fileName extension, or infer from URL extension
    const getFileType = () => {
        if (fileType) return fileType;

        const lowerName = fileName.toLowerCase();
        const lowerUrl = fileUrl.toLowerCase();

        if (lowerName.endsWith('.pdf') || lowerUrl.endsWith('.pdf')) return 'pdf';
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lowerName) || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lowerUrl)) return 'image';

        return 'unknown';
    };

    const type = getFileType();
    const isPdf = type === 'pdf';
    const isImage = type === 'image';

    // Reset state on new file
    useEffect(() => {
        setLoading(true);
        setError(false);
        setZoom(1);
    }, [fileUrl]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>

            {/* Header / Toolbar */}
            <div style={{
                height: '60px', padding: '0 20px', background: '#0f172a', borderBottom: '1px solid #334155',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#e2e8f0' }}>
                        {isPdf ? '📄' : isImage ? '🖼️' : '📁'} {fileName}
                    </h3>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#38bdf8', textDecoration: 'none', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}
                    >
                        Download Original
                    </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isImage && (
                        <>
                            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ color: '#94a3b8', background: 'none', border: '1px solid #334155', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>-</button>
                            <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} style={{ color: '#94a3b8', background: 'none', border: '1px solid #334155', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>+</button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            background: '#ef4444', border: 'none', color: 'white', width: '30px', height: '30px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '18px', marginLeft: '10px'
                        }}
                    >
                        &times;
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>

                {loading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', zIndex: 10 }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
                        <p>Loading document...</p>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', color: '#f87171', background: 'rgba(254, 226, 226, 0.1)', padding: '30px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                        <p style={{ margin: 0, fontWeight: '500' }}>Unable to preview file.</p>
                        <p style={{ fontSize: '14px', marginTop: '5px', color: '#94a3b8' }}>It might differ from its extension or be corrupted.</p>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '15px', color: '#38bdf8' }}>Try downloading instead</a>
                    </div>
                )}

                <div style={{ width: '100%', height: '100%', display: loading || error ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>

                    {isImage && (
                        <div style={{ overflow: 'auto', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={fileUrl}
                                alt={fileName}
                                style={{
                                    maxWidth: 'none', maxHeight: 'none',
                                    width: 'auto', height: 'auto',
                                    transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out',
                                    objectFit: 'contain'
                                }}
                                onLoad={() => setLoading(false)}
                                onError={() => { setLoading(false); setError(true); }}
                            />
                        </div>
                    )}

                    {isPdf && (
                        <iframe
                            src={`${fileUrl}`}
                            title={fileName}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', background: 'white', width: '90%', height: '95%', borderRadius: '8px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                            onLoad={() => setLoading(false)}
                            onError={() => { setLoading(false); setError(true); }}
                        />
                    )}

                    {!isImage && !isPdf && (
                        <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
                            <h3 style={{ margin: '0 0 10px 0' }}>Preview Unavailable</h3>
                            <p style={{ maxWidth: '300px', margin: '0 auto 20px auto', color: '#64748b' }}>
                                This file type ({fileName.split('.').pop()}) cannot be previewed directly in the browser.
                            </p>
                            <a
                                href={fileUrl}
                                download
                                style={{
                                    background: '#38bdf8', color: '#0f172a', textDecoration: 'none',
                                    padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold'
                                }}
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
