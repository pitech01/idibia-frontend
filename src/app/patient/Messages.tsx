import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services';

const Icons = {
    Edit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    ChevronLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
    Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Info: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Clock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Paperclip: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
    Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

export default function Messages({ user }: { user: any }) {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [chats, setChats] = useState<any[]>([]);
    const [activeMessages, setActiveMessages] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<any>(null);

    // Track window width regarding responsive behavior
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch chat list on mount
    useEffect(() => {
        loadChats();
        const chatListPoll = setInterval(loadChats, 30000); // Poll list every 30s
        return () => clearInterval(chatListPoll);
    }, []);

    // Load messages and start polling when a chat is selected
    useEffect(() => {
        if (selectedChatId) {
            loadMessages(selectedChatId);

            // Start polling for this chat
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(() => loadMessages(selectedChatId, true), 5000); // 5s poll

            return () => {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            };
        }
    }, [selectedChatId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    // Timer countdown logic
    useEffect(() => {
        if (!activeChat?.expires_at) {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(activeChat.expires_at).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Expired');
                clearInterval(interval);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m remaining`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeChat]);

    const loadChats = async () => {
        try {
            const { data } = await api.get('/chats');
            // Format chats for simplified view
            const formatted = data.map((c: any) => {
                const other = c.patient_id === user?.id ? c.doctor : c.patient;
                return {
                    id: c.id,
                    name: other?.name || 'Unknown User',
                    role: other?.role || 'Doctor', // Simplified role
                    lastMsg: c.latest_message?.message || 'New Request',
                    time: new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: 0, // Need backend count
                    online: true, // Mock online
                    img: `https://ui-avatars.com/api/?name=${other?.name}&background=random`,
                    encrypted: true,
                    status: c.status
                };
            });
            setChats(formatted);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMessages = async (chatId: number, isPoll = false) => {
        try {
            const { data } = await api.get(`/chats/${chatId}`);
            setActiveChat(data.chat);

            // Only update if messages length differs or it's not a poll to prevent jitters (basic check)
            if (!isPoll || data.messages.data.length !== activeMessages.length) {
                const formattedMsgs = data.messages.data.reverse().map((m: any) => ({
                    id: m.id,
                    sender: m.sender_id === user?.id ? 'me' : 'them',
                    text: m.message,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setActiveMessages(formattedMsgs);

                // Mark as read if receiving new messages
                if (data.messages.data.length > 0) {
                    api.put(`/chats/${chatId}/read`);
                }
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChatId) return;

        const tempMsg = {
            id: Date.now(),
            sender: 'me',
            text: messageInput,
            time: 'Sending...'
        };
        setActiveMessages(prev => [...prev, tempMsg]);
        setMessageInput('');

        try {
            await api.post(`/chats/${selectedChatId}/send`, { message: tempMsg.text });
            loadMessages(selectedChatId); // Refresh to get real ID and time
            loadChats(); // Refresh list to update preview
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleChatSelect = (id: number) => {
        setSelectedChatId(id);
        if (windowWidth <= 768) {
            setShowChatOnMobile(true);
        }
    };

    const isMobile = windowWidth <= 768;

    // Filter Logic
    const filteredChats = chats.filter((chat: any) => {
        const matchesFilter = activeFilter === 'All'
            ? true
            : activeFilter === 'Doctors'
                ? chat.role.includes('Doctor') || chat.role.includes('Dr')
                : activeFilter === 'Support' // Could just be a type on chat
                    ? false
                    : true;

        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gridTemplateRows: '1fr',
            height: '100%',
            minHeight: '0',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
        }}>
            {/* Sidebar */}
            <div style={{
                borderRight: '1px solid #e2e8f0',
                display: (isMobile && showChatOnMobile) ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Messages</h2>
                        <button style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}><Icons.Edit /></button>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}><Icons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px',
                                border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Doctors', 'Support'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    flex: 1, padding: '6px', borderRadius: '20px', border: 'none',
                                    background: activeFilter === filter ? '#0284c7' : 'transparent',
                                    color: activeFilter === filter ? 'white' : '#64748b',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredChats.map((chat: any) => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            style={{
                                display: 'flex', gap: '12px', padding: '16px 20px', cursor: 'pointer',
                                background: selectedChatId === chat.id && !isMobile ? '#f0f9ff' : 'white',
                                borderLeft: selectedChatId === chat.id && !isMobile ? '3px solid #0284c7' : '3px solid transparent'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={chat.img} alt={chat.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                {chat.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{chat.name}</h4>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>{chat.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                        {chat.lastMsg}
                                    </p>
                                    {chat.unread > 0 && (
                                        <div style={{ background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                            {chat.unread}
                                        </div>
                                    )}
                                    {chat.encrypted && <div style={{ color: '#94a3b8' }}><Icons.Lock /></div>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredChats.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No conversations yet</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {selectedChatId ? (
                <div style={{
                    display: (isMobile && !showChatOnMobile) ? 'none' : 'flex',
                    flexDirection: 'column',
                    background: '#f8fafc',
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isMobile && (
                                <button onClick={() => setShowChatOnMobile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <Icons.ChevronLeft />
                                </button>
                            )}
                            <div style={{ position: 'relative' }}>
                                {activeChatsAvatar(activeChat)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                                    {activeChatRoleName(activeChat, user)}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>General Practitioner</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Icons.Video /></button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Icons.Info /></button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Icons.Shield /> End-to-End Encrypted
                        </div>

                        {(activeChat?.status === 'active' || activeChat?.expires_at) && (
                            <div style={{
                                background: timeLeft === 'Expired' ? '#fee2e2' : '#fffbeb',
                                border: `1px solid ${timeLeft === 'Expired' ? '#ef4444' : '#fcd34d'}`,
                                borderRadius: '8px', padding: '8px',
                                textAlign: 'center', fontSize: '12px',
                                color: timeLeft === 'Expired' ? '#dc2626' : '#92400e',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                <div style={{ color: timeLeft === 'Expired' ? '#dc2626' : '#d97706' }}><Icons.Clock /></div>
                                {timeLeft === 'Expired' ? 'Session Expired: Chat is read-only' : `Session Active: Chat closes in ${timeLeft}`}
                            </div>
                        )}

                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>Today</div>

                        {activeMessages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>No messages yet. Say hello!</div>
                        ) : (
                            activeMessages.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                        alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: msg.sender === 'me' ? '#0284c7' : 'white',
                                        color: msg.sender === 'me' ? 'white' : '#1e293b',
                                        border: msg.sender === 'me' ? 'none' : '1px solid #e2e8f0',
                                        borderBottomRightRadius: msg.sender === 'me' ? '4px' : '12px',
                                        borderTopLeftRadius: msg.sender === 'them' ? '4px' : '12px',
                                        fontSize: '14px', lineHeight: '1.5',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{msg.time}</span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} disabled={timeLeft === 'Expired'}>
                            <Icons.Paperclip />
                        </button>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder={timeLeft === 'Expired' ? "Chat expired." : "Type a message..."}
                                value={messageInput}
                                disabled={timeLeft === 'Expired'}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '24px',
                                    border: '1px solid #e2e8f0', background: timeLeft === 'Expired' ? '#f1f5f9' : '#f8fafc',
                                    outline: 'none', fontSize: '14px',
                                    cursor: timeLeft === 'Expired' ? 'not-allowed' : 'text'
                                }}
                            />
                        </div>
                        <button onClick={handleSendMessage} disabled={timeLeft === 'Expired'} style={{ background: 'none', border: 'none', color: timeLeft === 'Expired' ? '#94a3b8' : '#0284c7', cursor: timeLeft === 'Expired' ? 'not-allowed' : 'pointer' }}>
                            <Icons.Send />
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: (isMobile && !showChatOnMobile) ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    color: '#94a3b8',
                    gap: '16px'
                }}>
                    <div style={{ opacity: 0.5 }}><Icons.Video /></div>
                    <p>Select a chat to start messaging</p>
                </div>
            )}
        </div>
    );
}

function activeChatsAvatar(chat: any) {
    if (!chat) return null;
    return (
        <>
            <img src={`https://ui-avatars.com/api/?name=${chat.doctor?.name}&background=random`} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
        </>
    )
}

function activeChatRoleName(chat: any, user: any) {
    if (!chat) return "";
    const other = chat.patient_id === user?.id ? chat.doctor : chat.patient;
    return other?.name || 'Unknown';
}
