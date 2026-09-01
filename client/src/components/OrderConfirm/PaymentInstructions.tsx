// client/src/components/OrderConfirm/PaymentInstructions.tsx
interface PaymentInstructionsProps {
    order: any
}

export function PaymentInstructions({ order }: PaymentInstructionsProps) {
    if (order?.payment?.provider === 'COD') {
        return (
            <div style={{
                background: '#FFFBEB',
                borderRadius: '16px',
                border: '1px solid #FDE68A',
                padding: '20px',
                marginBottom: '16px'
            }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', marginBottom: '6px' }}>
                    💵 Cash on Delivery
                </p>
                <p style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.6' }}>
                    Please keep <strong>Rs. {Number(order.total).toLocaleString()}</strong> ready when your order arrives.
                </p>
            </div>
        )
    }

    if (order?.payment?.provider === 'BANK_TRANSFER') {
        return (
            <div style={{
                background: '#EFF6FF',
                borderRadius: '16px',
                border: '1px solid #BFDBFE',
                padding: '20px',
                marginBottom: '16px'
            }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E40AF', marginBottom: '8px' }}>
                    🏦 Complete Your Bank Transfer
                </p>
                <p style={{ fontSize: '13px', color: '#1D4ED8', marginBottom: '4px' }}>
                    Bank: <strong>Meezan Bank</strong>
                </p>
                <p style={{ fontSize: '13px', color: '#1D4ED8', marginBottom: '4px' }}>
                    Account: <strong>Naz Calligraphy Art</strong>
                </p>
                <p style={{ fontSize: '13px', color: '#1D4ED8', marginBottom: '8px' }}>
                    Amount: <strong>Rs. {Number(order.total).toLocaleString()}</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                    Use <strong>{order.orderNumber}</strong> as payment reference and send screenshot to WhatsApp.
                </p>
            </div>
        )
    }

    return null
}