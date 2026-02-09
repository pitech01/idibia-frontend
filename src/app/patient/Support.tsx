import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

export default function Support() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('');

    // Create Ticket Form State
    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'general',
        priority: 'low',
        message: ''
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/support');
            setTickets(res.data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Creating ticket...');
        try {
            await api.post('/support', newTicket);
            toast.success('Ticket created successfully!', { id: toastId });
            setShowCreateModal(false);
            setNewTicket({ subject: '', category: 'general', priority: 'low', message: '' });
            fetchTickets();
        } catch (error) {
            toast.error('Failed to create ticket', { id: toastId });
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        const toastId = toast.loading('Sending reply...');
        try {
            await api.post(`/support/${selectedTicket.id}/reply`, { message: replyMessage });
            toast.success('Reply sent', { id: toastId });
            setReplyMessage('');
            const res = await api.get(`/support/${selectedTicket.id}`);
            setSelectedTicket(res.data); // Refresh chat
        } catch (error) {
            toast.error('Failed to send reply', { id: toastId });
        }
    };

    const fetchTicketDetails = async (id: number) => {
        const toastId = toast.loading('Loading conversation...');
        try {
            const res = await api.get(`/support/${id}`);
            setSelectedTicket(res.data);
            toast.dismiss(toastId);
        } catch (error) {
            toast.error('Failed to load ticket', { id: toastId });
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 20px 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Support & Help</h2>
                    <p style={{ color: '#64748b' }}>Track your support inquiries and get help.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '12px',
                        border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    + New Ticket
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading tickets...</div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {tickets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '40px', marginBottom: '20px' }}>💬</div>
                            <h3 style={{ color: '#1e293b' }}>No Support Tickets</h3>
                            <p style={{ color: '#64748b' }}>You haven't created any support tickets yet.</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => fetchTicketDetails(ticket.id)}
                                style={{
                                    background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0',
                                    cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{ticket.subject}</h4>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
                                            background: ticket.status === 'open' ? '#dbeafe' : ticket.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                                            color: ticket.status === 'open' ? '#1e40af' : ticket.status === 'resolved' ? '#166534' : '#64748b'
                                        }}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                        Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()} • {ticket.category}
                                    </p>
                                </div>
                                <div style={{ color: '#cbd5e1' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>New Support Ticket</h3>
                        <form onSubmit={handleCreateTicket}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Subject</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    placeholder="Brief summary of issue"
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="billing">Billing/Payment</option>
                                        <option value="appointment">Appointments</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Message</label>
                                <textarea
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', minHeight: '120px', resize: 'vertical', outline: 'none' }}
                                    placeholder="Describe your issue in detail..."
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', cursor: 'pointer', fontWeight: '600', color: 'white' }}
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Details/Chat Modal */}
            {selectedTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '600px', height: '80vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{selectedTicket.subject}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Ticket #{selectedTicket.id}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {selectedTicket.messages && selectedTicket.messages.map((msg: any) => {
                                const isMe = msg.user_id === selectedTicket.user_id; // For the user view, 'me' is the ticket owner
                                // Actually, we need to know who logged in. But for this specific component used by the user, 
                                // if the message user_id matches the ticket user_id, it is the user. 
                                // If it doesn't match, it's support/admin.

                                return (
                                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '16px',
                                            background: isMe ? '#2563eb' : 'white',
                                            color: isMe ? 'white' : '#334155',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            borderBottomRightRadius: isMe ? '4px' : '16px',
                                            borderBottomLeftRadius: isMe ? '16px' : '4px'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{msg.message}</p>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                                            {isMe ? 'You' : 'Support'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chat Input */}
                        <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                            {selectedTicket.status === 'closed' ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '10px' }}>This ticket is closed.</div>
                            ) : (
                                <form onSubmit={handleReply} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={e => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                    <button type="submit" style={{ padding: '0 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                        Send
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
