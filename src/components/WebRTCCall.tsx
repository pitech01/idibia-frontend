import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import { api } from '../services';
import { toast } from 'react-hot-toast';

interface WebRTCCallProps {
    appointmentId: number;
    userId: number;
    userName: string;
    receiverId: number;
    isDoctor: boolean;
    onClose: () => void;
}

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';

const WebRTCCall = ({ appointmentId, userId, userName, receiverId, isDoctor, onClose }: WebRTCCallProps) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'ongoing' | 'ended'>('connecting');
    const [globalCredits, setGlobalCredits] = useState<number>(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const socketRef = useRef<any>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // 1. Initialize Socket
        console.log('🔄 Initializing Socket.io connection to:', SIGNALING_SERVER);
        socketRef.current = io(SIGNALING_SERVER, {
            query: { userId, appointmentId },
            transports: ['polling', 'websocket'], // Try polling first for maximum compatibility
            secure: true,
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 20000
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to Signaling Server');
        });

        socketRef.current.on('connect_error', (err: any) => {
            console.error('❌ Signaling Server Connection Error:', err);
        });

        // 2. Initialize WebRTC Peer
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
        peerRef.current = pc;

        // 3. Setup Local Media
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                socketRef.current.emit('call:join', { appointmentId, userId, role: isDoctor ? 'doctor' : 'patient' });
                setCallStatus(isDoctor ? 'connecting' : 'ringing');
            } catch (err) {
                toast.error("Failed to access camera/mic");
                onClose();
            }
        };

        // 4. WebRTC Events
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                console.log('📡 Sending ICE Candidate');
                socketRef.current.emit('webrtc:signal', { 
                    appointmentId, 
                    appointment_id: appointmentId, 
                    target: receiverId, 
                    signal: { type: 'candidate', candidate: e.candidate } 
                });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('ongoing');
        };

        // 5. Signaling Server Events
        const initiateCall = async () => {
            if (isDoctor && peerRef.current) {
                console.log('🚀 Initiating Call as Doctor...');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit('webrtc:signal', { 
                    appointmentId, 
                    appointment_id: appointmentId, 
                    target: receiverId, 
                    signal: { type: 'offer', sdp: offer.sdp } 
                });
            }
        };

        socketRef.current.on('call:join', async (data: any) => {
            console.log('👤 Someone joined the call:', data);
            await initiateCall();
            setCallStatus('ongoing');
        });

        socketRef.current.on('call:ready', async () => {
            console.log('✨ Room is ready, both parties present');
            await initiateCall();
        });

        socketRef.current.on('webrtc:signal', async (data: any) => {
            const { signal } = data;
            console.log('🔀 Received signal:', signal.type);
            if (signal.type === 'offer') {
                console.log('📥 Processing Offer...');
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('📤 Sending Answer');
                socketRef.current.emit('webrtc:signal', { 
                    appointmentId, 
                    appointment_id: appointmentId, 
                    target: receiverId, 
                    signal: { type: 'answer', sdp: answer.sdp } 
                });
            } else if (signal.type === 'answer') {
                console.log('📥 Processing Answer...');
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.type === 'candidate') {
                console.log('📥 Adding ICE Candidate');
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        });

        socketRef.current.on('call:end', () => {
            handleEndCall(false);
            toast("The other party left the call");
        });

        // 6. Global Credit Tracking Heartbeat
        let heartbeatInterval: any;
        
        heartbeatInterval = setInterval(async () => {
            try {
                // Shared logic: Patient consumes, Doctor polls (amount: 0)
                const response = await api.post('/video-call/consume-credits', {
                    appointment_id: appointmentId,
                    amount: isDoctor ? 0 : 1 // 1 credit per minute from global pool
                });
                setGlobalCredits(response.data.remaining_global_credits);
            } catch (error: any) {
                if (error.response?.status === 402) {
                    toast.error(isDoctor ? "System global credits exhausted. Call suspended." : "Global credits exhausted. Terminating call.");
                    handleEndCall(true);
                }
            }
        }, 60000); // Every minute

        const startCallProtocol = async () => {
            try {
                const check = await api.post('/video-call/check-credits');
                if (!check.data.eligible) {
                    toast.error(check.data.message);
                    onClose();
                    return;
                }
                setGlobalCredits(check.data.global_credits);
            } catch (err) {
                toast.error("Global infrastructure check failed");
                onClose();
                return;
            }
            startMedia();
        };

        startCallProtocol();

        return () => {
            handleEndCall(false);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, []);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = (emit = true) => {
        setCallStatus('ended');
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        if (peerRef.current) peerRef.current.close();
        if (emit && socketRef.current) socketRef.current.emit('call:end', { appointmentId, target: receiverId });
        if (socketRef.current) socketRef.current.disconnect();
        onClose();
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes (handles escape key)
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return createPortal(
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, background: '#020617', zIndex: 999999, // Even higher z-index
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Background cinematic vignette */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #000 100%)', pointerEvents: 'none', zIndex: 1 }}></div>
            
            {/* Caller Info Pill */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: callStatus === 'ongoing' ? '#22c55e' : '#eab308', boxShadow: `0 0 12px ${callStatus === 'ongoing' ? '#22c55e' : '#eab308'}` }}></div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{isDoctor ? 'Patient' : 'Dr. ' + userName}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '12px' }}>{callStatus === 'ongoing' ? 'In Call' : 'Connecting...'}</div>
                <div style={{ color: globalCredits < 10 ? '#f87171' : '#fbbf24', fontSize: '11px', fontWeight: 'bold', marginLeft: '10px', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '10px' }}>
                    {globalCredits.toFixed(1)} Universal Credits
                </div>
            </div>
            
            {/* Fullscreen Button (Top Right) */}
            <button 
                onClick={toggleFullscreen} 
                style={{ 
                    position: 'absolute', top: '24px', right: isMobile ? '24px' : '260px', zIndex: 11, 
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', padding: '12px', color: 'white', cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                }}
            >
                {isFullscreen ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 0M4 4l0 5m11 0l5-5m0 0l-5 0m5 5l0-5m-5 11l5 5m0 0l-5 0m5-5l0 5M9 15l-5 5m0 0l5 0m-5-5l0 5"/></svg>
                ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
                )}
            </button>

            {/* Main Remote Video */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {(callStatus === 'connecting' || callStatus === 'ringing') && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', zIndex: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#3b82f6', color: 'white', fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(59,130,246,0.5)' }}>
                                {userName?.charAt(0) || 'U'}
                            </div>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>Calling {isDoctor ? 'Patient' : 'Dr. ' + userName}...</h2>
                            <div style={{ color: '#94a3b8' }}>Secure End-to-End Encrypted Call</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Local Video Mini */}
            <div style={{
                position: 'absolute', bottom: isMobile ? '120px' : '40px', right: isMobile ? '24px' : '40px', 
                width: isMobile ? '120px' : '220px', height: isMobile ? '160px' : '300px',
                borderRadius: '24px', overflow: 'hidden', background: '#1e293b', zIndex: 10,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', color: 'white', fontSize: '12px', backdropFilter: 'blur(8px)' }}>You</div>
            </div>

            {/* Bottom Controls */}
            <div style={{
                position: 'absolute', bottom: '40px', zIndex: 10, display: 'flex', gap: '20px',
                background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', padding: '20px 32px',
                borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button onClick={toggleMute} style={controlBtnStyle(isMuted)}>
                    {isMuted ? (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11v2a7 7 0 01-14 0v-2M12 21v-4m-4 0h8M8 8l8 8M12 3a3 3 0 00-3 3v2a3 3 0 106 0V6a3 3 0 00-3-3z"/></svg>
                    ) : (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11v2a7 7 0 01-14 0v-2M12 21v-4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>
                    )}
                </button>
                <button onClick={toggleVideo} style={controlBtnStyle(isVideoOff)}>
                    {isVideoOff ? (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18"/></svg>
                    ) : (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    )}
                </button>
                <button onClick={() => handleEndCall(true)} style={{ 
                    ...controlBtnStyle(false), 
                    background: '#ef4444', 
                    color: 'white', 
                    width: '68px', 
                    height: '68px',
                    margin: '-7px 0',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                }}>
                    <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.58.9-.98.45-1.87 1.05-2.65 1.76-.17.16-.42.22-.65.22s-.48-.06-.65-.22l-2.1-2.1c-.2-.2-.3-.47-.3-.75 0-.28.11-.55.32-.75C3.33 9.37 7.42 7.5 12 7.5s8.67 1.87 11.23 4.38c.21.2.32.47.32.75s-.1.55-.32.75l-2.12 2.12c-.17.17-.42.23-.65.23s-.48-.06-.65-.22c-.77-.71-1.67-1.31-2.65-1.76-.35-.16-.58-.51-.58-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                    </svg>
                </button>
            </div>
        </div>,
        document.body
    );
};

const controlBtnStyle = (active: boolean) => ({
    width: '54px', height: '54px', borderRadius: '50%',
    background: active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
    color: active ? '#ef4444' : 'white', 
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
});

export default WebRTCCall;
