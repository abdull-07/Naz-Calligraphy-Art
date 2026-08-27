import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'

interface RecentOrdersProps {
    orders: any[]
}

const statusConfig: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'Pending', class: 'badge-gold' },
    CONFIRMED: { label: 'Confirmed', class: 'badge-blue' },
    PROCESSING: { label: 'Processing', class: 'badge-teal' },
    SHIPPED: { label: 'Shipped', class: 'badge-purple' },
    DELIVERED: { label: 'Delivered', class: 'badge-green' },
    CANCELLED: { label: 'Cancelled', class: 'badge-red' },
    REFUNDED: { label: 'Refunded', class: 'badge-gray' },
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    const navigate = useNavigate()

    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
            }}>
                <div>
                    <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                    }}>
                        Recent Orders
                    </h3>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                        Latest {orders.length} orders
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="btn btn-secondary btn-sm"
                >
                    View All
                </button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state" style={{ padding: '40px' }}>
                                        <p>No orders yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : orders.map((order) => {
                            const status = statusConfig[order.status] ?? statusConfig.PENDING
                            return (
                                <tr key={order.id}>
                                    <td>
                                        <span style={{
                                            fontWeight: '600',
                                            color: '#C9A84C',
                                            fontSize: '13px',
                                        }}>
                                            #{order.orderNumber}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: '500', fontSize: '13px' }}>
                                                {order.user?.name ?? 'Guest'}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                                {order.user?.email ?? '—'}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '13px', color: '#6B7280' }}>
                                            {order.items?.[0]?.productName ?? '—'}
                                            {order.items?.length > 1 && (
                                                <span style={{ color: '#9CA3AF' }}>
                                                    {' '}+{order.items.length - 1} more
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#6B7280',
                                            background: '#F3F4F6',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontWeight: '500',
                                        }}>
                                            {order.payment?.provider ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${status.class}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                            {order.createdAt
                                                ? format(new Date(order.createdAt), 'MMM d, yyyy')
                                                : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#9CA3AF',
                                                padding: '4px',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#F3F4F6'
                                                e.currentTarget.style.color = '#C9A84C'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'none'
                                                e.currentTarget.style.color = '#9CA3AF'
                                            }}
                                        >
                                            <Eye size={15} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}