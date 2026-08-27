interface TopProductsProps {
    products: any[]
}

export default function TopProducts({ products }: TopProductsProps) {
    const max = products[0]?.totalSold ?? 1

    return (
        <div className="card">
            <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '16px',
            }}>
                Top Products
            </h3>

            {products.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                    <p style={{ fontSize: '13px' }}>No sales data yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {products.slice(0, 6).map((product, index) => (
                        <div key={product.productId ?? index}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Rank */}
                                    <span style={{
                                        width: '20px',
                                        height: '20px',
                                        background: index < 3
                                            ? 'linear-gradient(135deg, #C9A84C, #A8893A)'
                                            : '#F3F4F6',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: index < 3 ? '#1A1A1A' : '#9CA3AF',
                                        flexShrink: 0,
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#1A1A1A',
                                        maxWidth: '140px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {product.productName}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: '#1A1A1A',
                                    }}>
                                        {product.totalSold} sold
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                        Rs. {Number(product.totalRevenue).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '5px',
                                background: '#F3F4F6',
                                borderRadius: '999px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(product.totalSold / max) * 100}%`,
                                    background: index < 3
                                        ? 'linear-gradient(90deg, #C9A84C, #A8893A)'
                                        : '#2D7D9A',
                                    borderRadius: '999px',
                                    transition: 'width 0.8s ease',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}