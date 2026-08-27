import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    iconBg: string
    growth?: number    // % change
    prefix?: string    // e.g. "Rs."
    suffix?: string    // e.g. "orders"
}

export default function KpiCard({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    growth,
    prefix,
    suffix,
}: KpiCardProps) {
    const isPositive = growth !== undefined && growth > 0
    const isNegative = growth !== undefined && growth < 0
    const isNeutral = growth === 0

    return (
        <div className="kpi-card">

            {/* Icon */}
            <div
                className="kpi-icon"
                style={{ background: iconBg }}
            >
                {icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    fontWeight: '500',
                    marginBottom: '4px',
                }}>
                    {title}
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    flexWrap: 'wrap',
                }}>
                    {prefix && (
                        <span style={{
                            fontSize: '13px',
                            color: '#9CA3AF',
                            fontWeight: '500',
                        }}>
                            {prefix}
                        </span>
                    )}
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '1',
                    }}>
                        {typeof value === 'number'
                            ? value.toLocaleString()
                            : value}
                    </span>
                    {suffix && (
                        <span style={{
                            fontSize: '13px',
                            color: '#9CA3AF',
                            fontWeight: '500',
                        }}>
                            {suffix}
                        </span>
                    )}
                </div>

                {/* Growth or subtitle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                }}>
                    {growth !== undefined ? (
                        <>
                            {isPositive && (
                                <TrendingUp size={13} style={{ color: '#16A34A' }} />
                            )}
                            {isNegative && (
                                <TrendingDown size={13} style={{ color: '#DC2626' }} />
                            )}
                            {isNeutral && (
                                <Minus size={13} style={{ color: '#9CA3AF' }} />
                            )}
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: isPositive ? '#16A34A' : isNegative ? '#DC2626' : '#9CA3AF',
                            }}>
                                {growth > 0 ? '+' : ''}{growth}%
                            </span>
                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                vs last month
                            </span>
                        </>
                    ) : subtitle ? (
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {subtitle}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    )
}