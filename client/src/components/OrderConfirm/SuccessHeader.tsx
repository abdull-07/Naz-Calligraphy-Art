// client/src/components/OrderConfirm/SuccessHeader.tsx
import { CheckCircle, Copy } from 'lucide-react'

interface SuccessHeaderProps {
    order: any
    addressSnap: any
    onCopy: () => void
}

export function SuccessHeader({ order, addressSnap, onCopy }: SuccessHeaderProps) {
    return (
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(22,163,74,0.2)',
            }}>
                <CheckCircle size={40} style={{ color: '#16A34A' }} />
            </div>

            <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '10px',
            }}>
                Order Confirmed! 🎉
            </h1>

            <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.7', marginBottom: '20px' }}>
                Thank you{addressSnap?.fullName ? `, ${addressSnap.fullName.split(' ')[0]}` : ''}!
                Your order has been received and we'll start preparing it right away.
            </p>

            {order && (
                <div
                    onClick={onCopy}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: '#F8F4EF',
                        borderRadius: '999px',
                        border: '1px solid #F0EAE0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C9A84C'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#F0EAE0'}
                >
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Order:</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#C9A84C', letterSpacing: '0.05em' }}>
                        {order.orderNumber}
                    </span>
                    <Copy size={13} style={{ color: '#9CA3AF' }} />
                </div>
            )}
        </div>
    )
}