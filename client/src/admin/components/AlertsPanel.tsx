import { useNavigate } from 'react-router-dom'
import {
    AlertTriangle,
    MessageSquare,
    Star,
    Package,
} from 'lucide-react'

interface AlertsPanelProps {
    alerts: {
        pendingReviews: number
        unreadMessages: number
        lowStockVariants: number
        outOfStockVariants: number
    }
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
    const navigate = useNavigate()

    const items = [
        {
            icon: Star,
            label: 'Pending Reviews',
            count: alerts.pendingReviews,
            color: '#D97706',
            bg: '#FFFBEB',
            path: '/admin/reviews',
        },
        {
            icon: MessageSquare,
            label: 'Unread Messages',
            count: alerts.unreadMessages,
            color: '#2563EB',
            bg: '#EFF6FF',
            path: '/admin/contact',
        },
        {
            icon: AlertTriangle,
            label: 'Low Stock',
            count: alerts.lowStockVariants,
            color: '#D97706',
            bg: '#FFFBEB',
            path: '/admin/products',
        },
        {
            icon: Package,
            label: 'Out of Stock',
            count: alerts.outOfStockVariants,
            color: '#DC2626',
            bg: '#FEF2F2',
            path: '/admin/products',
        },
    ]

    return (
        <div className="card">
            <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '16px',
            }}>
                Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: item.count > 0 ? item.bg : '#F9FAFB',
                            borderRadius: '10px',
                            border: `1px solid ${item.count > 0 ? item.color + '30' : '#F3F4F6'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            width: '100%',
                            textAlign: 'left',
                            fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)'
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: item.count > 0 ? item.color + '20' : '#F3F4F6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <item.icon
                                size={16}
                                style={{ color: item.count > 0 ? item.color : '#9CA3AF' }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: item.count > 0 ? '#1A1A1A' : '#9CA3AF',
                            }}>
                                {item.label}
                            </p>
                        </div>

                        <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: item.count > 0 ? item.color : '#9CA3AF',
                            background: item.count > 0 ? item.color + '15' : '#F3F4F6',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            minWidth: '32px',
                            textAlign: 'center',
                        }}>
                            {item.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}