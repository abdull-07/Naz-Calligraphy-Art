// client/src/components/OrderConfirm/OrderTimeline.tsx
import { CheckCircle, Package, Truck, Home } from 'lucide-react'

interface OrderTimelineProps {
    order: any
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const steps = [
        { icon: CheckCircle, label: 'Order Placed', desc: 'Your order has been received', done: true },
        { icon: Package, label: 'Processing', desc: "We're preparing your items", done: false },
        { icon: Truck, label: 'Shipped', desc: `Dispatched via ${order?.courierName ?? 'courier'}`, done: false },
        { icon: Home, label: 'Delivered', desc: 'Enjoy your calligraphy supplies!', done: false },
    ]

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #F0EAE0',
            padding: '20px',
            marginBottom: '24px'
        }}>
            <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '20px'
            }}>
                What Happens Next
            </h3>

            {steps.map((step, index, arr) => (
                <div key={step.label} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: step.done
                                ? 'linear-gradient(135deg, #C9A84C, #A8893A)'
                                : '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: step.done ? '0 4px 10px rgba(201,168,76,0.3)' : 'none',
                        }}>
                            <step.icon size={16} style={{ color: step.done ? '#1A1A1A' : '#9CA3AF' }} />
                        </div>
                        {index < arr.length - 1 && (
                            <div style={{
                                width: '2px',
                                flex: 1,
                                background: step.done ? 'linear-gradient(#C9A84C, #E5E7EB)' : '#F3F4F6',
                                margin: '4px 0',
                                minHeight: '24px',
                            }} />
                        )}
                    </div>
                    <div style={{ paddingBottom: index < arr.length - 1 ? '20px' : '0' }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: step.done ? '#1A1A1A' : '#9CA3AF',
                        }}>
                            {step.label}
                        </p>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                            {step.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}