// client/src/pages/CheckoutPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { shopService } from '../services/shop.service'
import { calculateShipping, getCourierByKey } from '../utils/shipping'

// Import all sub-components
import {
    CheckoutHeader,
    GuestNotice,
    DeliveryForm,
    PaymentMethods,
    OrderSummary,
} from '../components/Checkout'

const schema = z.object({
    fullName: z.string().min(2, 'Full name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone required'),
    street: z.string().min(5, 'Street address required'),
    city: z.string().min(2, 'City required'),
    province: z.string().min(2, 'Province required'),
    postalCode: z.string().optional(),
    country: z.string().min(2, 'Country required').default('Pakistan'),
    payment: z.enum(['COD', 'JAZZCASH', 'EASYPAISA', 'HBL', 'BANK_TRANSFER']),
    note: z.string().optional(),
})

type FormData = z.input<typeof schema>

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [isPlacing, setIsPlacing] = useState(false)

    const {
        items,
        subtotal,
        couponCode,
        couponDiscount,
        clearCart,
        totalWeightKg,
        allFreeShipping,
        freeShipping,
        selectedCourier,
        setCourier,
    } = useCartStore()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            country: 'Pakistan',
            payment: 'COD',
        },
    })

    const selectedPayment = watch('payment')
    const weightKg = totalWeightKg()
    const isFreeShip = freeShipping || allFreeShipping()
    const shippingFee = calculateShipping(selectedCourier, weightKg, isFreeShip)
    const grandTotal = subtotal() - couponDiscount + shippingFee
    const courier = getCourierByKey(selectedCourier)

    if (items.length === 0) {
        navigate('/cart')
        return null
    }

    const onSubmit = async (values: FormData) => {
        setIsPlacing(true)
        try {
            const order = await shopService.placeOrder({
                items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
                shippingType: 'DOMESTIC',
                paymentProvider: values.payment as any,
                couponCode: couponCode ?? undefined,
                customerNote: values.note,
                courierName: courier?.name,
                shippingFee,
                guestInfo: {
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    street: values.street,
                    city: values.city,
                    province: values.province,
                    postalCode: values.postalCode,
                    country: values.country ?? 'Pakistan',
                },
            })

            clearCart()
            toast.success('Order placed successfully!')
            navigate(`/order-confirmation/${order.id}`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to place order. Please try again.')
        } finally {
            setIsPlacing(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>{`Checkout — Naz Calligraphy Art`}</title>
            </Helmet>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>
                <CheckoutHeader />
                {!user && <GuestNotice />}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 360px',
                            gap: '24px',
                            alignItems: 'start',
                        }}
                        className="checkout-grid"
                    >
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <DeliveryForm
                                register={register}
                                errors={errors}
                                selectedCourier={selectedCourier}
                                weightKg={weightKg}
                                isFreeShip={isFreeShip}
                                onCourierSelect={setCourier}
                            />

                            <PaymentMethods
                                register={register}
                                selectedPayment={selectedPayment}
                            />
                        </div>

                        {/* Right Column - Summary */}
                        <OrderSummary
                            items={items}
                            subtotal={subtotal()}
                            couponDiscount={couponDiscount}
                            shippingFee={shippingFee}
                            isFreeShip={isFreeShip}
                            weightKg={weightKg}
                            courier={courier}
                            grandTotal={grandTotal}
                            isPlacing={isPlacing}
                        />
                    </div>
                </form>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </>
    )
}