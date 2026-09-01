// client/src/components/OrderConfirm/DeliveryAddress.tsx
interface DeliveryAddressProps {
    addressSnap: any
}

export function DeliveryAddress({ addressSnap }: DeliveryAddressProps) {
    if (!addressSnap) return null

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #F0EAE0',
            padding: '20px',
            marginBottom: '16px'
        }}>
            <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '12px'
            }}>
                Delivery Address
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{addressSnap.fullName}</p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', lineHeight: '1.6' }}>
                {addressSnap.street}, {addressSnap.city}<br />
                {addressSnap.province}, {addressSnap.country}
                {addressSnap.postalCode && ` — ${addressSnap.postalCode}`}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                📱 {addressSnap.phone}
            </p>
            {addressSnap.email && (
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    ✉️ {addressSnap.email}
                </p>
            )}
        </div>
    )
}