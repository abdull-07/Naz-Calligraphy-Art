import { COURIERS, type CourierKey, 
    // calculateShipping 
} from '../../utils/shipping'

interface Props {
    selected: CourierKey
    weightKg: number
    freeShipping: boolean
    onSelect: (key: CourierKey) => void
}

export default function CourierSelector({
    selected, weightKg, freeShipping, onSelect,
}: Props) {

    if (freeShipping) {
        return (
            <div style={{
                padding: '14px 16px',
                background: '#F0FDF4',
                borderRadius: '10px',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <span style={{ fontSize: '20px' }}>🎉</span>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                        Free Shipping!
                    </p>
                    <p style={{ fontSize: '12px', color: '#16A34A' }}>
                        All items in your cart qualify for free shipping
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
            }}>
                <label style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0,
                }}>
                    Select Courier
                </label>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Total weight: <strong>{weightKg.toFixed(2)} KG</strong>
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {COURIERS.map((courier) => {
                    const rate = courier.calculate(weightKg)
                    const isSelected = selected === courier.key

                    return (
                        <div
                            key={courier.key}
                            onClick={() => onSelect(courier.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: `2px solid ${isSelected ? '#C9A84C' : '#E5E7EB'}`,
                                background: isSelected ? '#FFFBEB' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {/* Radio dot */}
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: `2px solid ${isSelected ? '#C9A84C' : '#D1D5DB'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.15s',
                            }}>
                                {isSelected && (
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#C9A84C',
                                    }} />
                                )}
                            </div>

                            {/* Logo */}
                            <span style={{ fontSize: '22px', flexShrink: 0 }}>
                                {courier.logo}
                            </span>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                    marginBottom: '2px',
                                }}>
                                    {courier.name}
                                </p>
                                <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                    {courier.description}
                                </p>
                                <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                    ⏱ {courier.estimatedDays}
                                </p>
                            </div>

                            {/* Rate */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: isSelected ? '#C9A84C' : '#1A1A1A',
                                }}>
                                    Rs. {rate.toLocaleString()}
                                </p>
                                <p style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                    for {weightKg.toFixed(2)} KG
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Rate breakdown for Pakistan Post */}
            {selected === 'PAKISTAN_POST' && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: '#F8F4EF',
                    borderRadius: '8px',
                    border: '1px solid #F0EAE0',
                }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Pakistan Post Rate Chart:
                    </p>
                    {[
                        { range: '0–1 KG', rate: 'Rs. 200' },
                        { range: '1–3 KG', rate: 'Rs. 270' },
                        { range: '3–5 KG', rate: 'Rs. 380' },
                        { range: '5–10 KG', rate: 'Rs. 570' },
                        // { range: '10+ KG', rate: 'Rs. 570 + Rs. 50/KG' },
                    ].map((row) => (
                        <div
                            key={row.range}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#6B7280',
                                padding: '2px 0',
                            }}
                        >
                            <span>{row.range}</span>
                            <span style={{ fontWeight: '500' }}>{row.rate}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}