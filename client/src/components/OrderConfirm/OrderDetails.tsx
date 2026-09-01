// client/src/components/OrderConfirm/OrderDetails.tsx
interface OrderDetailsProps {
    order: any
}

export function OrderDetails({ order }: OrderDetailsProps) {
    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #F0EAE0',
            overflow: 'hidden',
            marginBottom: '16px'
        }}>
            {/* Items */}
            <div style={{ padding: '20px', borderBottom: '1px solid #F9FAFB' }}>
                <h3 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: '16px'
                }}>
                    Items Ordered
                </h3>
                {order.items?.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            background: '#F8F4EF',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            opacity: 0.4
                        }}>
                            🖋
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>{item.productName}</p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.variantLabel} × {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>
                            Rs. {Number(item.subtotal).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pricing breakdown */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#6B7280' }}>Subtotal</span>
                    <span>Rs. {Number(order.subtotal).toLocaleString()}</span>
                </div>
                {Number(order.discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#16A34A' }}>Discount</span>
                        <span style={{ color: '#16A34A' }}>-Rs. {Number(order.discount).toLocaleString()}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#6B7280' }}>
                        Shipping {order.courierName ? `(${order.courierName})` : ''}
                    </span>
                    <span>
                        {Number(order.shippingFee) === 0
                            ? <span style={{ color: '#16A34A' }}>FREE</span>
                            : `Rs. ${Number(order.shippingFee).toLocaleString()}`
                        }
                    </span>
                </div>
            </div>

            {/* Total */}
            <div style={{
                padding: '16px 20px',
                background: '#F8F4EF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#C9A84C' }}>
                    Rs. {Number(order.total).toLocaleString()}
                </span>
            </div>
        </div>
    )
}