import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

const Icons = {
    Mail: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Trash: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Users: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/subscribers');
            setSubscribers(response.data);
        } catch (error) {
            toast.error('Failed to fetch subscribers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to remove this subscriber?')) return;

        try {
            await api.delete(`/admin/subscribers/${id}`);
            toast.success('Subscriber removed');
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (error) {
            toast.error('Failed to remove subscriber');
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailData.subject || !emailData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSending(true);
        try {
            const response = await api.post('/admin/subscribers/send-email', emailData);
            toast.success(response.data.message);
            setShowEmailModal(false);
            setEmailData({ subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send emails');
        } finally {
            setIsSending(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-subscribers-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', color: '#0f172a', margin: 0 }}>Newsletter Subscribers</h1>
                    <p style={{ color: '#64748b', marginTop: '5px' }}>Manage your community and send updates.</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowEmailModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', height: 'fit-content' }}
                >
                    <Icons.Send /> Send Email Blast
                </button>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Users />
                        </div>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Total Subscribers</p>
                            <h3 style={{ fontSize: '24px', margin: 0 }}>{subscribers.length}</h3>
                        </div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Mail />
                        </div>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Active</p>
                            <h3 style={{ fontSize: '24px', margin: 0 }}>{subscribers.filter(s => s.status === 'active').length}</h3>
                        </div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Trash />
                        </div>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Unsubscribed</p>
                            <h3 style={{ fontSize: '24px', margin: 0 }}>{subscribers.filter(s => s.status === 'unsubscribed').length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="search-bar" style={{ marginBottom: '20px', maxWidth: '400px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Icons.Search />
                </div>
                <input 
                    type="text" 
                    placeholder="Search by email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '12px 12px 12px 45px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        fontSize: '14px'
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600' }}>Email Address</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600' }}>Subscribed On</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading subscribers...</td></tr>
                        ) : filteredSubscribers.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No subscribers found.</td></tr>
                        ) : (
                            filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '500' }}>{subscriber.email}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600',
                                            background: subscriber.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                            color: subscriber.status === 'active' ? '#059669' : '#dc2626'
                                        }}>
                                            {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', color: '#64748b' }}>
                                        {new Date(subscriber.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleDelete(subscriber.id)}
                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '5px' }}
                                            title="Remove Subscriber"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="fade-in-up" style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '30px', background: '#0f172a', color: 'white' }}>
                            <h2 style={{ margin: 0 }}>Send Newsletter Blast</h2>
                            <p style={{ margin: '5px 0 0', opacity: 0.7 }}>This will be sent to all {subscribers.filter(s => s.status === 'active').length} active subscribers.</p>
                        </div>
                        <form onSubmit={handleSendEmail} style={{ padding: '30px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Email Subject</label>
                                <input 
                                    type="text" 
                                    placeholder="Weekly Health Updates..."
                                    className="form-input-clean"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Message Content</label>
                                <textarea 
                                    placeholder="Type your message here..."
                                    rows={8}
                                    className="form-input-clean"
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'none' }}
                                    required
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button 
                                    type="button" 
                                    className="btn" 
                                    onClick={() => setShowEmailModal(false)}
                                    style={{ padding: '12px 25px', borderRadius: '12px', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={isSending}
                                    style={{ padding: '12px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    {isSending ? 'Sending...' : <><Icons.Send /> Send Blast</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
