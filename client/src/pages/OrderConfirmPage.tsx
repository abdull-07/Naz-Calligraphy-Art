import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, Truck, Home, MessageCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { shopService } from '../services/shop.service'
// import { format } from 'date-fns'

export default function OrderConfirmPage() {
    const { id } = useParams()

    const { data: order, isLoading } = useQuery({
        queryKey: ['order-confirm', id],
        queryFn: () => shopService.getOrderConfirmation(Number(id)),
        enabled: !!id,
        retry: false,
    })

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
            </div>
        )
    }

    return (
        <>
            <Helmet><title>Order Confirmed — Naz Calligraphy Art</title></Helmet>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px' }}>

                {/* Success header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.2)' }}>
                        <CheckCircle size={40} style={{ color: '#16A34A' }} />
                    </div>

                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: '700', color: '#1A1A1A', marginBottom: '10px' }}>
                        Order Confirmed!
                    </h1>
                    <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.7' }}>
                        Thank you for your order. We'll start preparing it right away.
                    </p>

                    {order && (
                        <div style={{ display: 'inline-block', marginTop: '16px', padding: '8px 20px', background: '#F8F4EF', borderRadius: '999px', border: '1px solid #F0EAE0' }}>
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>Order Number: </span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#C9A84C' }}>{order.orderNumber}</span>
                        </div>
                    )}
                </div>

                {/* Order details */}
                {order && (
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', overflow: 'hidden', marginBottom: '24px' }}>

                        {/* Items */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #F9FAFB' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '16px' }}>
                                Items Ordered
                            </h3>
                            {order.items?.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F8F4EF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', opacity: 0.4 }}>
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

                        {/* Total */}
                        <div style={{ padding: '16px 20px', background: '#F8F4EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A' }}>Total Paid</span>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#C9A84C' }}>
                                Rs. {Number(order.total).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Tracking timeline */}
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '20px', marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px' }}>
                        What Happens Next
                    </h3>
                    {[
                        { icon: CheckCircle, label: 'Order Placed', desc: 'Your order has been received', done: true },
                        { icon: Package, label: 'Processing', desc: "We're preparing your items", done: false },
                        { icon: Truck, label: 'Shipped', desc: 'Your order is on its way', done: false },
                        { icon: Home, label: 'Delivered', desc: 'Enjoy your calligraphy supplies!', done: false },
                    ].map((step, index) => (
                        <div key={step.label} style={{ display: 'flex', gap: '12px', marginBottom: index < 3 ? '16px' : '0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: step.done ? 'linear-gradient(135deg, #C9A84C, #A8893A)' : '#F3F4F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <step.icon size={15} style={{ color: step.done ? '#1A1A1A' : '#9CA3AF' }} />
                                </div>
                                {index < 3 && (
                                    <div style={{ width: '2px', flex: 1, background: step.done ? '#C9A84C' : '#F3F4F6', marginTop: '4px', minHeight: '20px' }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: index < 3 ? '16px' : '0' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: step.done ? '#1A1A1A' : '#9CA3AF' }}>{step.label}</p>
                                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
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
                        }}
                    >
                        Continue Shopping
                    </Link>

                <a
                    href="https://wa.me/923001234567"
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

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '20px' }}>
                A confirmation will be sent to your email. For queries, WhatsApp us at +92 300 123 4567
            </p>
        </div >
    </>
  )
}