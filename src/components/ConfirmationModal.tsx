import { createPortal } from 'react-dom';
import { Trash2, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal = ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    type = 'info',
    confirmText,
    cancelText = 'Cancel'
}: ConfirmationModalProps) => {
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <Trash2 size={32} />;
            case 'warning': return <AlertCircle size={32} />;
            case 'success': return <AlertCircle size={32} />; // Could add Check icon if needed
            default: return <HelpCircle size={32} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger': return { bg: '#fef2f2', icon: '#ef4444', btn: '#ef4444' };
            case 'warning': return { bg: '#fffbeb', icon: '#f59e0b', btn: '#f59e0b' };
            case 'success': return { bg: '#f0fdf4', icon: '#10b981', btn: '#10b981' };
            default: return { bg: '#eff6ff', icon: '#3b82f6', btn: '#3b82f6' };
        }
    };

    const colors = getColors();
    const finalConfirmText = confirmText || (type === 'danger' ? 'Delete' : 'Confirm');

    return createPortal(
        <div 
            style={{
                position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 99999, padding: '20px',
                fontFamily: "'Outfit', sans-serif"
            }} 
            onClick={onCancel}
        >
            <div 
                style={{
                    background: 'white', borderRadius: '24px', width: '100%',
                    maxWidth: '400px', padding: '32px', textAlign: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }} 
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: colors.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: colors.icon
                }}>
                    {getIcon()}
                </div>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                    {title}
                </h3>
                
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
                    {message}
                </p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            border: '1px solid #e2e8f0', background: 'white',
                            color: '#64748b', fontWeight: '600', cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            border: 'none', background: colors.btn,
                            color: 'white', fontWeight: '600', cursor: 'pointer',
                            fontSize: '1rem', boxShadow: `0 4px 12px ${colors.btn}40`
                        }}
                    >
                        {finalConfirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
