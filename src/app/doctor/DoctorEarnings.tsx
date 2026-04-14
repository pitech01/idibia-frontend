import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

const Icons = {
    Total: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Monthly: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Today: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    External: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
    Download: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
};

export default function DoctorEarnings() {
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [earningsData, setEarningsData] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const handleExportStatement = async () => {
        setIsExporting(true);
        try {
            // Use the API service to get the file stream
            // Since our api utility handles headers/base URL, we can use it
            const response = await api.get('/doctor/earnings/export', {
                responseType: 'blob'
            });

            // Create a link to download the blob
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Dibia_Statement_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success("Statement exported successfully");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export statement from server");
        } finally {
            setIsExporting(false);
        }
    };

    const fetchEarnings = async () => {
        try {
            const response = await api.get('/doctor/earnings');
            setEarningsData(response.data);
        } catch (error) {
            console.error("Failed to fetch earnings", error);
            toast.error("Failed to load financial records");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #2E37A4', borderRadius: '50%' }}></div>
            </div>
        );
    }

    const { summary, transactions } = earningsData;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="doc-content animate-fade-in">
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                marginBottom: '40px',
                gap: isMobile ? '20px' : '0'
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', margin: 0 }}>Ledger & Revenue</h1>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>Detailed breakdown of your professional earnings and payouts.</p>
                </div>
                <button 
                    onClick={handleExportStatement}
                    disabled={isExporting}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
                        background: isExporting ? '#f8fafc' : 'white', 
                        border: '1px solid #e2e8f0', borderRadius: '12px', 
                        fontSize: '14px', fontWeight: '700', 
                        color: isExporting ? '#94a3b8' : '#1e293b', 
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'all 0.2s',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center',
                        opacity: isExporting ? 0.7 : 1
                    }}
                >
                    {isExporting ? (
                        <>
                            <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTop: '2px solid #2E37A4', borderRadius: '50%' }}></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Icons.Download /> Export Statement
                        </>
                    )}
                </button>
            </div>

            {/* Financial Performance Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                gap: isMobile ? '16px' : '32px', 
                marginBottom: '48px' 
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, #2E37A4 0%, #1e2894 100%)', 
                    padding: isMobile ? '24px' : '32px', borderRadius: '24px', color: 'white',
                    boxShadow: '0 20px 25px -5px rgba(46, 55, 164, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Total />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '20px' }}>EST. GROWTH +8%</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', margin: 0 }}>Aggregated Revenue</p>
                    <h3 style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '900', color: 'white', marginTop: '4px', margin: 0 }}>{formatCurrency(summary.total)}</h3>
                </div>

                <div style={{ 
                    background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '24px', 
                    border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Monthly />
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', margin: 0 }}>Current Billing Cycle</p>
                    </div>
                    <h3 style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{formatCurrency(summary.monthly)}</h3>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '20px' }}>
                        <div style={{ width: '65%', height: '100%', background: '#16a34a', borderRadius: '2px' }}></div>
                    </div>
                </div>

                <div style={{ 
                    background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '24px', 
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Today />
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', margin: 0 }}>Net Daily Intake</p>
                    </div>
                    <h3 style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{formatCurrency(summary.today)}</h3>
                </div>
            </div>

            {/* Reconciliation History */}
            <div className="doc-card" style={{ padding: '0', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                <div style={{ 
                    padding: isMobile ? '20px' : '24px 32px', 
                    borderBottom: '1px solid #f1f5f9', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    background: '#f8fafc',
                    gap: isMobile ? '12px' : '0'
                }}>
                    <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Transaction Reconciliation</h3>
                    <div style={{ width: isMobile ? '100%' : 'auto' }}>
                        <select style={{ 
                            width: isMobile ? '100%' : 'auto',
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            color: '#475569', 
                            outline: 'none' 
                        }}>
                            <option>All Transactions</option>
                            <option>Completed</option>
                            <option>Pending</option>
                        </select>
                    </div>
                </div>

                {isMobile ? (
                    <div style={{ padding: '8px' }}>
                        {transactions.map((tx: any) => (
                            <div key={tx.id} style={{ 
                                padding: '16px', 
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#2E37A4' }}>
                                            {tx.patient_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{tx.patient_name}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>REF: ID-TX-{tx.id}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '15px' }}>{formatCurrency(tx.amount)}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{tx.time.substring(0, 5)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ 
                                        background: tx.status === 'completed' ? '#dcfce7' : '#fef9c3', 
                                        color: tx.status === 'completed' ? '#166534' : '#854d0e', 
                                        padding: '4px 10px', borderRadius: '30px', fontSize: '10px', fontWeight: '900',
                                        border: `1px solid ${tx.status === 'completed' ? '#bbf7d0' : '#fef08a'}`
                                    }}>
                                        {tx.status.toUpperCase()}
                                    </span>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference / Patient</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifecycle</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Value</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '64px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📝</div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>No transactions recorded</h3>
                                            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Your clinical earnings will appear here.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx: any) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#2E37A4' }}>
                                                        {tx.patient_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{tx.patient_name}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>REF: ID-TX-{tx.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '13px' }}>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{tx.time.substring(0, 5)} GMT</div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '16px' }}>{formatCurrency(tx.amount)}</div>
                                                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: '800' }}>PLATFORM FEE INCL.</div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ 
                                                    background: tx.status === 'completed' ? '#dcfce7' : '#fef9c3', 
                                                    color: tx.status === 'completed' ? '#166534' : '#854d0e', 
                                                    padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '900',
                                                    letterSpacing: '0.02em', border: `1px solid ${tx.status === 'completed' ? '#bbf7d0' : '#fef08a'}`
                                                }}>
                                                    {tx.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                <button style={{ 
                                                    width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', 
                                                    border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                }} title="View Receipt">
                                                    <Icons.External />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ 
                    padding: isMobile ? '16px' : '20px 32px', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#f8fafc',
                    gap: isMobile ? '12px' : '0'
                }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Showing {transactions.length} record(s)</span>
                    <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                        <button disabled style={{ flex: isMobile ? 1 : 'none', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#cbd5e1', fontWeight: '700', fontSize: '12px' }}>Previous</button>
                        <button disabled style={{ flex: isMobile ? 1 : 'none', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#cbd5e1', fontWeight: '700', fontSize: '12px' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
