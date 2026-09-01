// client/src/pages/OrderConfirmPage.tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { shopService } from '../services/shop.service'
import toast from 'react-hot-toast'

// Import all sub-components
import { LoadingState, SuccessHeader, OrderDetails, DeliveryAddress, OrderTimeline, PaymentInstructions, OrderActions } from '../components/OrderConfirm'

export default function OrderConfirmPage() {
    const { id } = useParams()

    const { data: order, isLoading } = useQuery({
        queryKey: ['order-confirm', id],
        queryFn: () => shopService.getGuestOrder(Number(id)),
        enabled: !!id,
        retry: 1,
    })

    const copyOrderNumber = () => {
        if (order?.orderNumber) {
            navigator.clipboard.writeText(order.orderNumber)
            toast.success('Order number copied!')
        }
    }

    if (isLoading) {
        return <LoadingState />
    }

    const addressSnap = order?.addressSnapshot as any

    return (
        <>
            <Helmet>
                <title>{`Order Confirmed — Naz Calligraphy Art`}</title>
            </Helmet>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>
                <SuccessHeader order={order} addressSnap={addressSnap} onCopy={copyOrderNumber} />

                {order && (
                    <>
                        <OrderDetails order={order} />
                        <DeliveryAddress addressSnap={addressSnap} />
                        <OrderTimeline order={order} />
                        <PaymentInstructions order={order} />
                        <OrderActions order={order} />
                    </>
                )}

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '24px', lineHeight: '1.6' }}>
                    Save your order number <strong style={{ color: '#C9A84C' }}>{order?.orderNumber}</strong> for tracking.
                    {addressSnap?.email && ` A confirmation email will be sent to ${addressSnap.email}.`}
                </p>
            </div>
        </>
    )
}