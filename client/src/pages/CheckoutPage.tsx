import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { ShieldCheck, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '../stores/cartStore'
import { shopService } from '../services/shop.service'
import { calculateShipping, getCourierByKey} from '../utils/shipping'
import CourierSelector from '../components/shop/CourierSelector'

const schema = z.object({
    fullName: z.string().min(2, 'Full name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone required'),
    street: z.string().min(5, 'Street address required'),
    city: z.string().min(2, 'City required'),
    province: z.string().min(2, 'Province required'),
    postalCode: z.string().optional(),
    country: z.string().default('Pakistan'),
    payment: z.enum(['COD', 'JAZZCASH', 'EASYPAISA', 'HBL', 'BANK_TRANSFER']),
    note: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

const paymentOptions = [
    // { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
    { value: 'JAZZCASH', label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet', icon: '📱' },
    { value: 'EASYPAISA', label: 'EasyPaisa', desc: 'Pay via EasyPaisa mobile wallet', icon: '📲' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'Transfer directly to our account', icon: '🏦' },
]

export default function CheckoutPage() {
    const navigate = useNavigate()
    const {
        items, subtotal, couponCode, couponDiscount,
        clearCart, totalWeightKg, allFreeShipping,
        freeShipping, selectedCourier, setCourier,
    } = useCartStore()
    const [isPlacing, setIsPlacing] = useState(false)

    const weightKg = totalWeightKg()
    const isFreeShip = freeShipping || allFreeShipping()
    const shippingFee = calculateShipping(selectedCourier, weightKg, isFreeShip)
    const grandTotal = subtotal() - couponDiscount + shippingFee
    const courier = getCourierByKey(selectedCourier)

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInput, unknown, FormData>({
        resolver: zodResolver(schema),
        defaultValues: { country: 'Pakistan', payment: 'COD' },
    })

    const selectedPayment = watch('payment')

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
                paymentProvider: values.payment,
                couponCode: couponCode ?? undefined,
                customerNote: values.note,
                guestInfo: {
                    name: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    address: {
                        street: values.street,
                        city: values.city,
                        province: values.province,
                        postalCode: values.postalCode,
                        country: values.country,
                    },
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
            <Helmet><title>Checkout — Naz Calligraphy Art</title></Helmet>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', fontWeight: '700', color: '#1A1A1A', marginBottom: '32px' }}>
                    Checkout
                </h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }} className="checkout-grid">

                        {/* Left — Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Shipping Info */}
                            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Truck size={18} style={{ color: '#C9A84C' }} />
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#1A1A1A' }}>
                                        Shipping Information
                                    </h3>
                                </div>

                                <div className="form-grid form-grid-2">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input {...register('fullName')} className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="Ahmad Hassan" />
                                        {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input {...register('phone')} className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+92 300 1234567" />
                                        {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="ahmad@email.com" />
                                    {errors.email && <p className="error-text">{errors.email.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label>Street Address *</label>
                                    <input {...register('street')} className={`input ${errors.street ? 'input-error' : ''}`} placeholder="House #123, Street 4, Block A" />
                                    {errors.street && <p className="error-text">{errors.street.message}</p>}
                                </div>

                                <div className="form-grid form-grid-2">
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input {...register('city')} className={`input ${errors.city ? 'input-error' : ''}`} placeholder="Jhang" />
                                        {errors.city && <p className="error-text">{errors.city.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label>Province *</label>
                                        <select {...register('province')} className={`input ${errors.province ? 'input-error' : ''}`}>
                                            <option value="">Select Province</option>
                                            {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'Gilgit-Baltistan'].map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        {errors.province && <p className="error-text">{errors.province.message}</p>}
                                    </div>
                                </div>

                                <div className="form-grid form-grid-2">
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input {...register('postalCode')} className="input" placeholder="35200" />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input {...register('country')} className="input" defaultValue="Pakistan" />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Order Note (Optional)</label>
                                    <textarea {...register('note')} className="input" rows={2} placeholder="Special instructions for your order..." style={{ resize: 'vertical' }} />
                                </div>
                                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
                                    <CourierSelector
                                        selected={selectedCourier}
                                        weightKg={weightKg}
                                        freeShipping={isFreeShip}
                                        onSelect={setCourier}
                                    />
                                </div>
                            </div>

                            {/* Payment */}
                            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <ShieldCheck size={18} style={{ color: '#C9A84C' }} />
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#1A1A1A' }}>
                                        Payment Method
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {paymentOptions.map((opt) => (
                                        <label
                                            key={opt.value}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 16px',
                                                borderRadius: '10px',
                                                border: `2px solid ${selectedPayment === opt.value ? '#C9A84C' : '#E5E7EB'}`,
                                                background: selectedPayment === opt.value ? '#FFFBEB' : '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                margin: 0,
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                value={opt.value}
                                                {...register('payment')}
                                                style={{ accentColor: '#C9A84C', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', margin: 0 }}>{opt.label}</p>
                                                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Bank details for bank transfer */}
                                {selectedPayment === 'JAZZCASH' && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: '#F8F4EF', borderRadius: '10px', border: '1px solid #F0EAE0', fontSize: '13px' }}>
                                        <p style={{ fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>JazzCash Account Details:</p>
                                        {/* <p style={{ color: '#374151', marginBottom: '4px' }}>Bank: <strong>Meezan Bank</strong></p> */}
                                        <p style={{ color: '#374151', marginBottom: '4px' }}>Account Title: <strong>Arslan Afzal</strong></p>
                                        <p style={{ color: '#374151', marginBottom: '4px' }}>IBAN: <strong>03126619439</strong></p>
                                        <p style={{ color: '#9CA3AF', marginTop: '8px', fontSize: '12px' }}>
                                            After transfer, send screenshot to WhatsApp: +92 325 5176697
                                        </p>
                                    </div>
                                )}
                                {selectedPayment === 'EASYPAISA' && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: '#F8F4EF', borderRadius: '10px', border: '1px solid #F0EAE0', fontSize: '13px' }}>
                                        <p style={{ fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>EasyPaisa Account Details:</p>
                                        {/* <p style={{ color: '#374151', marginBottom: '4px' }}>Bank: <strong>Meezan Bank</strong></p> */}
                                        <p style={{ color: '#374151', marginBottom: '4px' }}>Account Title: <strong>Arslan Afzal</strong></p>
                                        <p style={{ color: '#374151', marginBottom: '4px' }}>IBAN: <strong>03126619439</strong></p>
                                        <p style={{ color: '#9CA3AF', marginTop: '8px', fontSize: '12px' }}>
                                            After transfer, send screenshot to WhatsApp: +92 325 5176697
                                        </p>
                                    </div>
                                )}
                                {selectedPayment === 'BANK_TRANSFER' && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: '#F8F4EF', borderRadius: '10px', border: '1px solid #F0EAE0', fontSize: '13px' }}>
                                        <p style={{ fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Bank Account Details:</p>
                                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                            <div>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Bank: <strong>Meezan Bank</strong></p>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Account Title: <strong>Arslan Afzal</strong></p>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Account Number: <strong>08597914251003</strong></p>
                                                {/* <p style={{ color: '#374151', marginBottom: '4px' }}>IBAN: <strong>PK00MEZN0000000000000</strong></p> */}
                                            </div>
                                            <div>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Bank: <strong>Meezan Bank</strong></p>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Account Title: <strong>Arslan Afzal</strong></p>
                                                <p style={{ color: '#374151', marginBottom: '4px' }}>Account Number: <strong>00300110297480</strong></p>
                                                {/* <p style={{ color: '#374151', marginBottom: '4px' }}>IBAN: <strong>PK00MEZN0000000000000</strong></p> */}
                                            </div>
                                        </div>
                                        <p style={{ color: '#9CA3AF', marginTop: '8px', fontSize: '12px' }}>
                                            After transfer, send screenshot to WhatsApp: +92 325 5176697
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right — Summary */}
                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '24px', position: 'sticky', top: '88px' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px' }}>
                                Order Summary
                            </h3>

                            {/* Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                                {items.map((item) => (
                                    <div key={item.variantId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#F8F4EF', flexShrink: 0 }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', opacity: 0.2 }}>🖋</div>
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.productName}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.variantLabel} × {item.quantity}</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', flexShrink: 0 }}>
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #F0EAE0', marginBottom: '20px' }}>
                                {[
                                    { label: 'Subtotal', value: `Rs. ${subtotal().toLocaleString()}` },
                                    ...(couponDiscount > 0 ? [{
                                        label: 'Discount',
                                        value: `-Rs. ${couponDiscount.toLocaleString()}`,
                                        color: '#16A34A',
                                    }] : []),
                                    {
                                        label: isFreeShip ? 'Shipping (Free!)' : `Shipping — ${courier?.name}`,
                                        value: isFreeShip ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`,
                                        color: isFreeShip ? '#16A34A' : undefined,
                                    }
                                ].map((row: any) => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#6B7280' }}>{row.label}</span>
                                        <span style={{ fontWeight: '500', color: row.color ?? '#1A1A1A' }}>{row.value}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F0EAE0' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Total</span>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#C9A84C' }}>Rs. {grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Place order button */}
                            <button
                                type="submit"
                                disabled={isPlacing}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: isPlacing ? 'rgba(201,168,76,0.6)' : 'linear-gradient(135deg, #C9A84C, #A8893A)',
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
                                    <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#1A1A1A' }} /> Placing Order...</>
                                ) : (
                                    <><ShieldCheck size={17} /> Place Order — Rs. {grandTotal.toLocaleString()}</>
                                )}
                            </button>

                            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '10px' }}>
                                By placing this order you agree to our Terms & Conditions
                            </p>
                        </div>
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