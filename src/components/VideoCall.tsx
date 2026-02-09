import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoCallProps {
    roomName: string;
    userName: string;
    onClose: () => void;
}

export default function VideoCall({ roomName, userName, onClose }: VideoCallProps) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'black',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 10000
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid white',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Ends Call
                </button>
            </div>
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: false,
                    disableDeepLinking: true,
                }}
                interfaceConfigOverwrite={{
                    FILM_STRIP_MAX_HEIGHT: 120,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                }}
                userInfo={{
                    displayName: userName,
                    email: ''
                }}
                onApiReady={() => {
                    // console.log('Jitsi Meeting API is ready');
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                }}
            />
        </div>
    );
}
