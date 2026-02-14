import { useState, useEffect } from 'react';
import { api } from '../../services';
import toast from 'react-hot-toast';

const Icons = {
    Total: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Monthly: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Today: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    External: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
};

export default function DoctorEarnings() {
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState<any>(null);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const response = await api.get('/doctor/earnings');
            setEarningsData(response.data);
        } catch (error) {
            console.error("Failed to fetch earnings", error);
            toast.error("Failed to load earnings data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%' }}></div>
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
        <div className="doc-content-area animate-fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Earnings</h1>
                <p style={{ color: '#64748b' }}>Track your consultation revenue and transactions.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Total />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Earnings</p>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(summary.total)}</h3>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Monthly />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>This Month</p>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(summary.monthly)}</h3>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Today />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Today</p>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(summary.today)}</h3>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="doc-card" style={{ padding: '0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Recent Transactions</h3>
                    <button style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Patient</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Amount</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx: any) => (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                                                    {tx.patient_name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: '600', color: '#0f172a' }}>{tx.patient_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ color: '#0f172a', fontWeight: '500' }}>{new Date(tx.date).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.time.substring(0, 5)}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a' }}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                {tx.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Icons.External />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
