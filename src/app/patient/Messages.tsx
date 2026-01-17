import { useState, useEffect } from 'react';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Edit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Info: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    More: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
    Paperclip: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
    Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Shield: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Clock: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ChevronLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
};

export default function Messages() {
    const [selectedChatId, setSelectedChatId] = useState(1);
    const [activeFilter, setActiveFilter] = useState('All');
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Track window width for responsive behavior
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [chats, setChats] = useState([
        {
            id: 1,
            name: 'Dr. Chioma Okeke',
            role: 'General Practitioner',
            lastMsg: 'Please take the tablet after eating...',
            time: '1:34 PM',
            unread: 0,
            online: true,
            img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
            encrypted: false,
            messages: [
                { id: 1, sender: 'me', text: "It's a dull pain, mostly at the front of my head. It gets worse in the afternoon.", time: '12:04 PM' },
                { id: 2, sender: 'them', text: "I see. This sounds like tension headaches, which are quite common. Have you been under stress lately or spending a lot of time on screens?", time: '12:10 PM' },
                { id: 3, sender: 'me', text: "Yes, I've been working late on my laptop for the past week.", time: '1:22 PM' },
                { id: 4, sender: 'them', text: "Please take the tablet after eating. I'm prescribing Paracetamol 500mg. Take one tablet every 6 hours. Also try to take regular breaks from screens - the 20-20-20 rule helps.", time: '1:34 PM' },
            ]
        },
        {
            id: 2,
            name: 'Dr. Adebayo Ogundimu',
            role: 'Cardiologist',
            lastMsg: 'Your ECG results look normal.',
            time: '11:52 AM',
            unread: 0,
            online: false,
            img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
            encrypted: true,
            messages: []
        },
        {
            id: 3,
            name: 'Dr. Ngozi Eze',
            role: 'Dermatologist',
            lastMsg: 'Can you send a clear photo of the rash?',
            time: '8:52 AM',
            unread: 1,
            online: true,
            img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop',
            encrypted: false,
            messages: []
        },
        {
            id: 4,
            name: 'iDibia Support',
            role: 'Support Team',
            lastMsg: 'Your payment has been confirmed ✓',
            time: 'Yesterday',
            unread: 0,
            online: true,
            img: 'https://i.pravatar.cc/150?img=12',
            encrypted: false,
            messages: []
        },
    ]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const updatedChats = chats.map(chat => {
            if (chat.id === selectedChatId) {
                const newMsg = {
                    id: Date.now(),
                    sender: 'me',
                    text: messageInput,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                return {
                    ...chat,
                    lastMsg: messageInput,
                    time: 'Just now',
                    messages: [...chat.messages, newMsg]
                };
            }
            return chat;
        });

        setChats(updatedChats);
        setMessageInput('');
    };

    const activeChat = chats.find(c => c.id === selectedChatId);

    // Filter Logic
    const filteredChats = chats.filter(chat => {
        const matchesFilter = activeFilter === 'All'
            ? true
            : activeFilter === 'Doctors'
                ? chat.role.includes('Dr.')
                : activeFilter === 'Support'
                    ? chat.role.includes('Support')
                    : true;

        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleChatSelect = (id: number) => {
        setSelectedChatId(id);
        if (windowWidth <= 768) {
            setShowChatOnMobile(true);
        }
    };

    const isMobile = windowWidth <= 768;

    return (
        <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gridTemplateRows: '1fr', // Ensure one row that fills height
            height: '100%',
            minHeight: '0', // Critical for nested flex scrolling
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
        }}>
            {/* Sidebar - Hide on mobile if chat is active */}
            <div style={{
                borderRight: '1px solid #e2e8f0',
                display: (isMobile && showChatOnMobile) ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Ensure it respects grid height
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
                    {filteredChats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            style={{
                                display: 'flex', gap: '12px', padding: '16px 20px', cursor: 'pointer',
                                background: selectedChatId === chat.id && !isMobile ? '#f0f9ff' : 'white', // Highlight only on desktop
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
                </div>
            </div>

            {/* Main Chat Area - Show on mobile if active, otherwise hide */}
            <div style={{
                display: (isMobile && !showChatOnMobile) ? 'none' : 'flex',
                flexDirection: 'column',
                background: '#f8fafc',
                overflow: 'hidden' // Ensure it respects grid height
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
                            <img src={activeChat?.img} alt={activeChat?.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            {activeChat?.online && <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{activeChat?.name}</h3>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{activeChat?.role}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Icons.Video /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Icons.Info /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Icons.More /></button>
                    </div>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Icons.Shield /> End-to-End Encrypted
                    </div>
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px', textAlign: 'center', fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ color: '#d97706' }}><Icons.Clock /></div> Session Active: Chat closes in 3 hours
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>Today</div>

                    {activeChat?.messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>No messages yet. Start the conversation!</div>
                    ) : (
                        activeChat?.messages.map(msg => (
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
                                    boxShadow: msg.sender === 'them' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }}>
                                    {msg.text}
                                </div>
                                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{msg.time}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <Icons.Paperclip />
                    </button>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '24px',
                                border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px'
                            }}
                        />
                    </div>
                    <button onClick={handleSendMessage} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}>
                        <Icons.Send />
                    </button>
                </div>
            </div>
        </div>
    );
}
