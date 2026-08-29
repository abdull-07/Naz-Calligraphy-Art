import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useCartStore } from '../stores/cartStore'
import { shopService } from '../services/shop.service'
import CourierSelector from '../components/shop/CourierSelector'
import { calculateShipping, COURIERS } from '../utils/shipping'

export default function CartPage() {
    const navigate = useNavigate()
    const {
        items, updateQty, removeItem, clearCart,
        couponCode, couponDiscount, freeShipping,
        applyCoupon, removeCoupon,
        subtotal, totalWeightKg, allFreeShipping,
        selectedCourier, setCourier,
    } = useCartStore()

    const weightKg = totalWeightKg()
    const isFreeShip = freeShipping || allFreeShipping()
    const shippingFee = calculateShipping(selectedCourier, weightKg, isFreeShip)
    const grandTotal = subtotal() - couponDiscount + shippingFee

    const [couponInput, setCouponInput] = useState('')
    const [couponLoading, setCouponLoading] = useState(false)


    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return
        setCouponLoading(true)
        try {
            const result = await shopService.validateCoupon(couponInput, subtotal())
            applyCoupon(result.code, result.discount)
            toast.success(`Coupon applied! You saved Rs. ${result.discount.toLocaleString()}`)
            setCouponInput('')
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Invalid coupon code')
        } finally {
            setCouponLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <>
                <Helmet><title>Cart — Naz Calligraphy Art</title></Helmet>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🛒</div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px' }}>
                        Your cart is empty
                    </h2>
                    <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '15px' }}>
                        Explore our collection and find the perfect calligraphy supplies.
                    </p>
                    <Link
                        to="/shop"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #C9A84C, #A8893A)', color: '#1A1A1A', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}
                    >
                        <ShoppingBag size={17} />
                        Browse Shop
                    </Link>
                </div>
            </>
        )
    }

    return (
        <>
            <Helmet>
                <title>{`Cart (${items.length}) — Naz Calligraphy Art`}</title>
            </Helmet>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>
                    Shopping Cart
                </h1>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>
                    {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }} className="cart-grid">

                    {/* Items */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', overflow: 'hidden' }}>
                        {items.map((item, index) => (
                            <div
                                key={item.variantId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '20px',
                                    borderBottom: index < items.length - 1 ? '1px solid #F9FAFB' : 'none',
                                }}
                            >
                                {/* Image */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: '#F8F4EF', flexShrink: 0, border: '1px solid #F0EAE0' }}>
                                    {item.image
                                        ? <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', opacity: 0.2 }}>🖋</div>
                                    }
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link to={`/shop/${item.slug}`} style={{ textDecoration: 'none' }}>
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.productName}
                                        </p>
                                    </Link>
                                    <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px' }}>
                                        {item.variantLabel}
                                        {item.localShippingOnly && (
                                            <span style={{ marginLeft: '8px', fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                                Local Shipping
                                            </span>
                                        )}
                                    </p>

                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                                            <button
                                                onClick={() => updateQty(item.variantId, item.quantity - 1)}
                                                style={{ width: '30px', height: '30px', background: '#F9FAFB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQty(item.variantId, item.quantity + 1)}
                                                style={{ width: '30px', height: '30px', background: '#F9FAFB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.variantId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', borderRadius: '6px', display: 'flex', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                            Rs. {item.price.toLocaleString()} each
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Clear cart */}
                        <div style={{ padding: '16px 20px', borderTop: '1px solid #F9FAFB', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { if (confirm('Clear your cart?')) clearCart() }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                            >
                                <Trash2 size={13} /> Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '24px', position: 'sticky', top: '88px' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px' }}>
                            Order Summary
                        </h3>

                        {/* Coupon */}
                        {!couponCode ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                    Coupon Code
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                        <input
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="SAVE10"
                                            style={{ width: '100%', padding: '9px 10px 9px 30px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
                                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponInput}
                                        style={{ padding: '9px 14px', background: couponInput ? '#1A1A1A' : '#F3F4F6', border: 'none', borderRadius: '8px', color: couponInput ? '#FFFFFF' : '#9CA3AF', fontWeight: '600', fontSize: '13px', cursor: couponInput ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag size={14} style={{ color: '#16A34A' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>{couponCode}</span>
                                </div>
                                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px', lineHeight: 1 }}>×</button>
                            </div>
                        )}


                        <div style={{ marginBottom: '16px' }}>
                            <CourierSelector
                                selected={selectedCourier}
                                weightKg={totalWeightKg()}
                                freeShipping={freeShipping || allFreeShipping()}
                                onSelect={setCourier}
                            />
                        </div>

                        {/* Totals */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {[
                                { label: 'Subtotal', value: `Rs. ${subtotal().toLocaleString()}` },
                                ...(couponDiscount > 0 ? [{
                                    label: `Discount (${couponCode})`,
                                    value: `-Rs. ${couponDiscount.toLocaleString()}`,
                                    color: '#16A34A',
                                }] : []),
                                {
                                    label: isFreeShip
                                        ? 'Shipping (Free!)'
                                        : `Shipping — ${COURIERS.find(c => c.key === selectedCourier)?.name}`,
                                    value: isFreeShip ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`,
                                    color: isFreeShip ? '#16A34A' : undefined,
                                },
                                ...(weightKg > 0 && !isFreeShip ? [{
                                    label: `Total weight`,
                                    value: `${weightKg.toFixed(2)} KG`,
                                    color: '#9CA3AF',
                                }] : []),
                            ].map((row: any) => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#6B7280' }}>{row.label}</span>
                                    <span style={{ fontWeight: '500', color: row.color ?? '#1A1A1A' }}>{row.value}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0EAE0', marginTop: '4px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Total</span>
                                <span style={{ fontSize: '18px', fontWeight: '700', color: '#C9A84C' }}>
                                    Rs. {grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            onClick={() => navigate('/checkout')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #C9A84C, #A8893A)',
                                color: '#1A1A1A',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                                transition: 'all 0.2s',
                                fontFamily: 'Inter, sans-serif',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Proceed to Checkout <ArrowRight size={16} />
                        </button>

                        <Link
                            to="/shop"
                            style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </>
    )
}