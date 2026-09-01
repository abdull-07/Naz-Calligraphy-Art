// client/src/components/OrderConfirm/OrderActions.tsx
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

interface OrderActionsProps {
    order: any
}

export function OrderActions({ order }: OrderActionsProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
                to="/shop"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #C9A84C, #A8893A)',
                    color: '#1A1A1A',
                    padding: '14px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '15px',
                    textAlign: 'center',
                    boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                }}
            >
                Continue Shopping
            </Link>

            <a
                href={`https://wa.me/923001234567?text=Hi! I placed order ${order?.orderNumber ?? ''} and need assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#F0FDF4',
                    color: '#166534',
                    padding: '13px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: '1px solid #BBF7D0',
                }}
            >
                <MessageCircle size={16} />
                Track order on WhatsApp
            </a>
        </div>
    )
}