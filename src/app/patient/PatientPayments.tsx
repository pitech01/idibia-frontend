import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services';
import Preloader from '../../components/Preloader';

const Icons = {
    Wallet: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    ArrowUpRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" /></svg>,
    ArrowDownLeft: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M17 17H7V7" /></svg>,
    Link: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    Dots: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    CreditCard: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Building: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Hash: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
    CheckCircle: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    Close: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Download: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Flag: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 13a4.002 4.002 0 01-1.726 1.76l-1.487.696A2 2 0 004 17.276V21M12 9a4 4 0 004 4M21 9a4 4 0 00-4 4" /></svg> // Approximate flag/report icon
};

export default function PatientPayments() {
    // Default balanceVisible to false as per user request
    const [balanceVisible, setBalanceVisible] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('5,000');
    const [paymentMethod, setPaymentMethod] = useState('card');

    // State to track which transaction's action menu is open
    const [activeActionId, setActiveActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // Close action menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
        // Check for payment callback
        const params = new URLSearchParams(window.location.search);
        const trxref = params.get('reference');
        if (trxref) {
            verifyPayment(trxref);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, transRes] = await Promise.all([
                api.get('/user'),
                api.get('/payments')
            ]);
            setUser(userRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error("Failed to load payment data", error);
            toast.error("Failed to load wallet info");
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (ref: string) => {
        const toastId = toast.loading("Verifying payment...");
        try {
            await api.post('/payments/verify', { reference: ref });
            toast.success("Payment successful!", { id: toastId });
            // Clear URL param
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchData(); // Refresh balance
        } catch (error) {
            toast.error("Payment verification failed", { id: toastId });
        }
    };

    const handleTopUp = async () => {
        if (!topUpAmount) return;
        setProcessing(true);
        const cleanAmount = topUpAmount.replace(/,/g, '');

        try {
            const { data } = await api.post('/payments/initialize', {
                amount: parseFloat(cleanAmount),
                email: user?.email
            });

            // Redirect to Paystack
            window.location.href = data.authorization_url;
        } catch (error) {
            toast.error("Failed to initialize payment");
            setProcessing(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return { color: '#059669', border: '1px solid #059669', background: 'white' };
            case 'pending': return { color: '#d97706', border: '1px solid #d97706', background: '#fffbeb' };
            case 'failed': return { color: '#dc2626', border: '1px solid #dc2626', background: 'white' };
            default: return {};
        }
    };

    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="payment-header">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Payments & Wallet</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', background: '#e2e8f0', borderRadius: '50%' }}><Icons.Lock /></span> Secured by <strong style={{ color: '#0f172a' }}>Paystack</strong>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="payment-grid">

                {/* Wallet Balance Card */}
                <div style={{
                    background: '#0ea5e9', // Fallback
                    backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                    borderRadius: '16px',
                    padding: '32px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                }}>
                    {/* Decor circles */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '200px', height: '200px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '120px', height: '120px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '15px', marginBottom: '8px' }}>
                                <Icons.Wallet /> Available Balance
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '-1px' }}>
                                {balanceVisible ? `₦${parseFloat(user?.patient?.wallet_balance || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₦****'}
                            </div>
                        </div>
                        <button
                            onClick={() => setBalanceVisible(!balanceVisible)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}
                        >
                            {balanceVisible ? <Icons.EyeOff /> : <Icons.Eye />}
                        </button>
                    </div>

                    <div className="wallet-actions">
                        <button
                            onClick={() => setShowTopUpModal(true)}
                            style={{
                                background: 'white', color: '#0ea5e9',
                                border: 'none', padding: '12px 24px', borderRadius: '8px',
                                fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Icons.Plus /> Top Up Wallet
                        </button>
                        <button style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)', padding: '12px 24px', borderRadius: '8px',
                            fontWeight: '500', fontSize: '15px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Icons.ArrowUpRight /> Withdraw / Refund
                        </button>
                    </div>
                </div>

                {/* Insurance Card */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', marginBottom: '16px' }}>
                        <Icons.Shield />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Health Insurance</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                        Link your HMO (AXA, Hygeia) to pay for consultations automatically.
                    </p>
                    <button style={{
                        width: '100%',
                        background: '#0284c7', color: 'white',
                        border: 'none', padding: '12px', borderRadius: '8px',
                        fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginTop: 'auto'
                    }}>
                        <Icons.Link /> Link Provider
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: '500px' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Transaction History</h3>
                </div>

                <div className="table-responsive">
                    <table className="trans-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Date</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Description</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Method</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Status</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Amount</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                                    <td style={{ padding: '20px 32px', color: '#94a3b8', fontSize: '14px' }}>{t.date}</td>
                                    <td style={{ padding: '20px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: '500', fontSize: '14px' }}>
                                            <span style={{ color: '#94a3b8' }}>
                                                {t.type === 'debit' ? <Icons.ArrowUpRight /> : <Icons.ArrowDownLeft />}
                                            </span>
                                            {t.desc}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 32px', color: '#64748b', fontSize: '14px' }}>{t.method}</td>
                                    <td style={{ padding: '20px 32px' }}>
                                        <span style={{
                                            ...getStatusStyle(t.status),
                                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                                        }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 32px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: t.type === 'credit' ? '#0f172a' : '#0f172a' }}>
                                        {t.type === 'credit' ? '+' : '-'} ₦{t.amount}
                                    </td>
                                    <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveActionId(activeActionId === t.id ? null : t.id);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                            >
                                                <Icons.Dots />
                                            </button>

                                            {/* DROPDOWN MENU */}
                                            {activeActionId === t.id && (
                                                <div
                                                    ref={actionMenuRef}
                                                    style={{
                                                        position: 'absolute', right: '0', top: '100%',
                                                        background: 'white', borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        border: '1px solid #e2e8f0', zIndex: 50,
                                                        width: '180px', overflow: 'hidden',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <button style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        width: '100%', padding: '12px 16px', background: 'white',
                                                        border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                                        color: '#334155', fontSize: '14px', fontWeight: '500'
                                                    }}>
                                                        <Icons.Download /> Download Receipt
                                                    </button>
                                                    <button style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        width: '100%', padding: '12px 16px', background: 'white',
                                                        border: 'none', cursor: 'pointer',
                                                        color: '#94a3b8', fontSize: '14px', fontWeight: '500'
                                                    }}>
                                                        <Icons.Flag /> Report Issue
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TOP UP MODAL */}
            {showTopUpModal && (
                <div className="top-up-modal">
                    <div className="top-up-modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Top Up Wallet</h3>
                            <button onClick={() => setShowTopUpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <Icons.Close />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Enter Amount</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#64748b', fontSize: '18px' }}>₦</span>
                                <input
                                    type="text"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    style={{
                                        width: '88%', padding: '16px 16px 16px 40px', fontSize: '16px', fontWeight: '600',
                                        border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', color: '#0f172a'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                {['2,000', '5,000', '10,000'].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setTopUpAmount(amt)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                            background: topUpAmount === amt ? '#0284c7' : '#f1f5f9',
                                            color: topUpAmount === amt ? 'white' : '#64748b',
                                            fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                                        }}
                                    >
                                        ₦{amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>Payment Method</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', borderRadius: '12px',
                                        border: paymentMethod === 'card' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                        background: paymentMethod === 'card' ? '#f0f9ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                                            <Icons.CreditCard />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Card Payment</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Visa, Mastercard, Verve</div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'card' ? <div style={{ color: '#0284c7' }}><Icons.CheckCircle /></div> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('bank')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', borderRadius: '12px',
                                        border: paymentMethod === 'bank' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                        background: paymentMethod === 'bank' ? '#f0f9ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            <Icons.Building />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>Bank Transfer</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Pay via bank transfer</div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'bank' ? <div style={{ color: '#0284c7' }}><Icons.CheckCircle /></div> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('ussd')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', borderRadius: '12px',
                                        border: paymentMethod === 'ussd' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                        background: paymentMethod === 'ussd' ? '#f0f9ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            <Icons.Hash />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>USSD</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Pay via USSD code</div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'ussd' ? <div style={{ color: '#0284c7' }}><Icons.CheckCircle /></div> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                style={{
                                    background: 'white', color: '#334155', border: 'none',
                                    padding: '12px 24px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopUp}
                                disabled={processing}
                                style={{
                                    background: processing ? '#94a3b8' : '#0284c7', color: 'white', border: 'none',
                                    padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '15px',
                                    cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)'
                                }}>
                                {processing ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
