import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

export default function Support() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0' }}>Support & Help</h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>Track your support inquiries and get help.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        background: '#2E37A4', color: 'white', padding: isMobile ? '12px' : '14px 28px', borderRadius: '14px',
                        border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        width: isMobile ? '100%' : 'auto', justifyContent: 'center',
                        boxShadow: '0 10px 15px -3px rgba(46, 55, 164, 0.2)'
                    }}
                >
                    <span style={{ fontSize: '20px' }}>+</span> New Ticket
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
                                    background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0',
                                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2E37A4'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1e293b' }}>{ticket.subject}</h4>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                                            background: ticket.status === 'open' ? '#eff6ff' : ticket.status === 'resolved' ? '#f0fdf4' : '#f8fafc',
                                            color: ticket.status === 'open' ? '#2563eb' : ticket.status === 'resolved' ? '#16a34a' : '#64748b',
                                            border: `1px solid ${ticket.status === 'open' ? '#dbeafe' : ticket.status === 'resolved' ? '#dcfce7' : '#e2e8f0'}`
                                        }}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                                        <span style={{ color: '#94a3b8' }}>#{ticket.id}</span> • {new Date(ticket.created_at).toLocaleDateString()} • <span style={{ textTransform: 'capitalize' }}>{ticket.category}</span>
                                    </p>
                                </div>
                                <div style={{ color: '#94a3b8', paddingLeft: '16px' }}>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ 
                        background: 'white', 
                        padding: isMobile ? '24px' : '40px', 
                        borderRadius: isMobile ? '24px 24px 0 0' : '32px', 
                        width: '100%', 
                        maxWidth: '550px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: isMobile ? 'fixed' : 'relative',
                        bottom: isMobile ? 0 : 'unset',
                        maxHeight: isMobile ? '90vh' : 'auto',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#1e293b' }}>New Ticket</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Subject</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '500' }}
                                    placeholder="Brief summary of issue"
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '500' }}
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="billing">Billing/Payment</option>
                                        <option value="appointment">Appointments</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '500' }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Message</label>
                                <textarea
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', minHeight: '120px', resize: 'vertical', outline: 'none', background: '#f8fafc', fontWeight: '500' }}
                                    placeholder="Describe your issue in detail..."
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: '700', color: '#475569', order: isMobile ? 2 : 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#2E37A4', cursor: 'pointer', fontWeight: '800', color: 'white', order: isMobile ? 1 : 2, boxShadow: '0 4px 6px -1px rgba(46, 55, 164, 0.2)' }}
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Ticket Details/Chat Modal */}
            {selectedTicket && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ 
                        background: 'white', 
                        width: '100%', 
                        maxWidth: '650px', 
                        height: isMobile ? '100%' : '80vh', 
                        borderRadius: isMobile ? '0' : '32px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Chat Header */}
                        <div style={{ padding: isMobile ? '24px 20px' : '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>{selectedTicket.subject}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Ticket #{selectedTicket.id} • {selectedTicket.category.toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>
 
                        {/* Chat Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {selectedTicket.messages && selectedTicket.messages.map((msg: any) => {
                                const isMe = msg.user_id === selectedTicket.user_id;
 
                                return (
                                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '90%' : '80%' }}>
                                        <div style={{
                                            padding: '14px 20px',
                                            borderRadius: '20px',
                                            background: isMe ? '#2E37A4' : 'white',
                                            color: isMe ? 'white' : '#1e293b',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                            borderBottomRightRadius: isMe ? '4px' : '20px',
                                            borderBottomLeftRadius: isMe ? '20px' : '4px',
                                            border: isMe ? 'none' : '1px solid #e2e8f0'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>{msg.message}</p>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', textAlign: isMe ? 'right' : 'left', padding: '0 4px', fontWeight: '700' }}>
                                            {isMe ? 'You' : 'Support Agent'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
 
                        {/* Chat Input */}
                        <div style={{ padding: isMobile ? '20px' : '24px 32px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                            {selectedTicket.status === 'closed' ? (
                                <div style={{ textAlign: 'center', color: '#ef4444', padding: '12px', background: '#fef2f2', borderRadius: '12px', fontSize: '14px', fontWeight: '700' }}>This ticket has been resolved and closed.</div>
                            ) : (
                                <form onSubmit={handleReply} style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={e => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        style={{ flex: 1, padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '500' }}
                                    />
                                    <button 
                                        type="submit" 
                                        style={{ 
                                            background: '#2E37A4', color: 'white', border: 'none', borderRadius: '14px', 
                                            fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                            justifyContent: 'center', padding: '0 24px'
                                        }}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
