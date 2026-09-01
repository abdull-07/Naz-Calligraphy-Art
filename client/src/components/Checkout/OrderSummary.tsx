import { ShieldCheck } from 'lucide-react'

interface OrderSummaryProps {
    items: any[]
    subtotal: number
    couponDiscount: number
    shippingFee: number
    isFreeShip: boolean
    weightKg: number
    courier: any
    grandTotal: number
    isPlacing: boolean
}

export function OrderSummary({
    items,
    subtotal,
    couponDiscount,
    shippingFee,
    isFreeShip,
    weightKg,
    courier,
    grandTotal,
    isPlacing,
}: OrderSummaryProps) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F0EAE0',
                padding: '24px',
                position: 'sticky',
                top: '88px',
            }}
        >
            <h3
                style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: '20px',
                }}
            >
                Order Summary
            </h3>

            {/* Items list */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '16px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                }}
            >
                {items.map((item) => (
                    <div key={item.variantId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#F8F4EF',
                                flexShrink: 0,
                            }}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.productName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.2,
                                    }}
                                >
                                    🖋
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#1A1A1A',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {item.productName}
                            </p>
                            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                {item.variantLabel} × {item.quantity}
                            </p>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', flexShrink: 0 }}>
                            Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid #F0EAE0',
                    marginBottom: '20px',
                }}
            >
                {[
                    { label: 'Subtotal', value: `Rs. ${subtotal.toLocaleString()}` },
                    ...(couponDiscount > 0
                        ? [{ label: 'Discount', value: `-Rs. ${couponDiscount.toLocaleString()}`, color: '#16A34A' }]
                        : []),
                    {
                        label: isFreeShip ? 'Shipping (Free!)' : `${courier?.name ?? 'Shipping'}`,
                        value: isFreeShip ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`,
                        color: isFreeShip ? '#16A34A' : undefined,
                    },
                    ...(!isFreeShip && weightKg > 0
                        ? [{ label: 'Weight', value: `${weightKg.toFixed(2)} KG`, color: '#9CA3AF' }]
                        : []),
                ].map((row: any) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#6B7280' }}>{row.label}</span>
                        <span style={{ fontWeight: '500', color: row.color ?? '#1A1A1A' }}>
                            {row.value}
                        </span>
                    </div>
                ))}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid #F0EAE0',
                    }}
                >
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Total</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#C9A84C' }}>
                        Rs. {grandTotal.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Place order */}
            <button
                type="submit"
                disabled={isPlacing}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isPlacing
                        ? 'rgba(201,168,76,0.6)'
                        : 'linear-gradient(135deg, #C9A84C, #A8893A)',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: isPlacing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                }}
            >
                {isPlacing ? (
                    <>
                        <div
                            className="spinner"
                            style={{
                                width: '16px',
                                height: '16px',
                                borderWidth: '2px',
                                borderTopColor: '#1A1A1A',
                            }}
                        />
                        Placing Order...
                    </>
                ) : (
                    <>
                        <ShieldCheck size={17} />
                        Place Order — Rs. {grandTotal.toLocaleString()}
                    </>
                )}
            </button>

            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '10px' }}>
                By placing this order you agree to our Terms & Conditions
            </p>
        </div>
    )
}