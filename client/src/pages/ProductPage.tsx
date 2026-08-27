import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ArrowLeft, Truck, Shield, Star, ChevronRight, MessageCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { shopService } from '../services/shop.service'
import { useCartStore } from '../stores/cartStore'
import ProductCard from '../components/shop/ProductCard'

export default function ProductPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const addItem = useCartStore((s) => s.addItem)

    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)
    const [activeTab, setActiveTab] = useState('description')

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => shopService.getProduct(slug!),
        enabled: !!slug,
    })

    const { data: relatedData } = useQuery({
        queryKey: ['related', product?.categoryId],
        queryFn: () => shopService.getProducts({ category: product?.category?.slug, limit: 4 as any }),
        enabled: !!product?.categoryId,
    })

    if (isLoading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
            </div>
        )
    }

    if (isError || !product) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', color: '#6B7280' }}>Product not found.</p>
                <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Back to Shop
                </button>
            </div>
        )
    }

    const variants = product.variants ?? []
    const currentVariant = selectedVariant ?? variants[0]
    const images = product.images ?? []
    const price = Number(currentVariant?.price ?? 0)
    const compare = Number(currentVariant?.comparePrice ?? 0)
    const discount = compare > price ? Math.round(((compare - price) / compare) * 100) : 0
    const inStock = currentVariant?.stockStatus !== 'OUT_OF_STOCK'
    const stockQty = currentVariant?.stockQty ?? 0
    const related = (relatedData?.data ?? []).filter((p: any) => p.id !== product.id).slice(0, 4)

    const handleAddToCart = () => {
        if (!currentVariant) { toast.error('Select a variant'); return }
        if (!inStock) { toast.error('Out of stock'); return }

        addItem({
            variantId: currentVariant.id,
            productId: product.id,
            productName: product.name,
            variantLabel: currentVariant.label,
            price,
            comparePrice: compare > 0 ? compare : null,
            quantity,
            image: images[0]?.url ?? null,
            slug: product.slug,
            localShippingOnly: product.localShippingOnly,
        })

        toast.success('Added to cart!')
    }

    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'shipping', label: 'Shipping' },
        { id: 'reviews', label: `Reviews (${product._count?.reviews ?? 0})` },
    ]

    return (
        <>
            <Helmet>
                <title>{`${product?.name ?? 'Product'} — Naz Calligraphy Art`}</title>
                <meta name="description" content={product?.seoDescription ?? product?.description ?? ''} />
            </Helmet>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 60px' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#9CA3AF' }}>
                    <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                        <ArrowLeft size={14} /> Shop
                    </button>
                    <ChevronRight size={12} />
                    <span style={{ color: '#6B7280' }}>{product.category?.name}</span>
                    <ChevronRight size={12} />
                    <span style={{ color: '#1A1A1A', fontWeight: '500' }}>{product.name}</span>
                </div>

                {/* Product section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }} className="product-grid">

                    {/* Images */}
                    <div>
                        {/* Main image */}
                        <div style={{ aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#F8F4EF', marginBottom: '12px', border: '1px solid #F0EAE0' }}>
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImage]?.url}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', opacity: 0.1 }}>🖋</div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {images.map((img: any, i: number) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(i)}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: `2px solid ${activeImage === i ? '#C9A84C' : '#E5E7EB'}`,
                                            cursor: 'pointer',
                                            background: 'none',
                                            padding: 0,
                                            transition: 'border-color 0.2s',
                                        }}
                                    >
                                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        {/* Category */}
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {product.category?.name}
                        </p>

                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px', lineHeight: '1.3' }}>
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {(product._count?.reviews ?? 0) > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={14} style={{ color: '#C9A84C', fill: '#C9A84C' }} />
                                ))}
                                <span style={{ fontSize: '13px', color: '#6B7280' }}>({product._count.reviews} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A' }}>
                                Rs. {price.toLocaleString()}
                            </span>
                            {compare > price && (
                                <>
                                    <span style={{ fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '10px' }}>
                                        Rs. {compare.toLocaleString()}
                                    </span>
                                    <span style={{ marginLeft: '8px', background: '#DC2626', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                                        -{discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Variants */}
                        {variants.length > 1 && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                    Select Option:
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {variants.map((v: any) => (
                                        <button
                                            key={v.id}
                                            onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: `2px solid ${currentVariant?.id === v.id ? '#C9A84C' : '#E5E7EB'}`,
                                                background: currentVariant?.id === v.id ? '#FEF3C7' : '#FFFFFF',
                                                color: currentVariant?.id === v.id ? '#92400E' : '#374151',
                                                fontWeight: currentVariant?.id === v.id ? '700' : '500',
                                                fontSize: '13px',
                                                cursor: v.stockStatus === 'OUT_OF_STOCK' ? 'not-allowed' : 'pointer',
                                                opacity: v.stockStatus === 'OUT_OF_STOCK' ? 0.5 : 1,
                                                transition: 'all 0.2s',
                                                fontFamily: 'Inter, sans-serif',
                                            }}
                                            disabled={v.stockStatus === 'OUT_OF_STOCK'}
                                        >
                                            {v.label}
                                            <span style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                                                Rs. {Number(v.price).toLocaleString()}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: inStock ? '#16A34A' : '#DC2626', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: inStock ? '#16A34A' : '#DC2626' }}>
                                {inStock ? `In Stock (${stockQty} available)` : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Quantity */}
                        {inStock && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0 }}>Qty:</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        style={{ width: '36px', height: '36px', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#374151' }}
                                    >
                                        −
                                    </button>
                                    <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(stockQty, q + 1))}
                                        style={{ width: '36px', height: '36px', background: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#374151' }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: inStock ? 'linear-gradient(135deg, #C9A84C, #A8893A)' : '#F3F4F6',
                                    color: inStock ? '#1A1A1A' : '#9CA3AF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: inStock ? 'pointer' : 'not-allowed',
                                    boxShadow: inStock ? '0 4px 14px rgba(201,168,76,0.35)' : 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                <ShoppingCart size={18} />
                                {inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <a
                                href={`https://wa.me/923001234567?text=Hi! I'm interested in ${product.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 18px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s' }}
                            >
                                <MessageCircle size={17} />
                                Order via WhatsApp
                            </a>
                        </div>

                        {/* Trust badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: '#F8F4EF', borderRadius: '12px', border: '1px solid #F0EAE0' }}>
                            {[
                                { icon: Truck, text: `${product.localShippingOnly ? 'Local shipping only (Pakistan)' : 'Worldwide shipping available'}` },
                                { icon: Shield, text: '100% authentic — quality guaranteed' },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Icon size={14} style={{ color: '#C9A84C', flexShrink: 0 }} />
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #F0EAE0', marginBottom: '24px', gap: '4px' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 20px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab.id ? '700' : '500',
                                    color: activeTab === tab.id ? '#C9A84C' : '#6B7280',
                                    borderBottom: `2px solid ${activeTab === tab.id ? '#C9A84C' : 'transparent'}`,
                                    transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif',
                                    marginBottom: '-1px',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'description' && (
                        <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', maxWidth: '700px' }}>
                            {product.description
                                ? <p>{product.description}</p>
                                : <p style={{ color: '#9CA3AF' }}>No description available.</p>
                            }
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div style={{ maxWidth: '600px' }}>
                            {[
                                { label: 'Pakistan (Domestic)', value: 'Rs. 150 flat rate — 2–5 business days' },
                                { label: 'Middle East', value: 'Rs. 800+ — 7–14 business days' },
                                { label: 'UK / Europe', value: 'Rs. 1,200+ — 10–21 business days' },
                                { label: 'USA / Canada', value: 'Rs. 1,500+ — 10–21 business days' },
                            ].map((item) => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', fontSize: '14px' }}>
                                    <span style={{ fontWeight: '500', color: '#374151' }}>{item.label}</span>
                                    <span style={{ color: '#6B7280' }}>{item.value}</span>
                                </div>
                            ))}
                            {product.localShippingOnly && (
                                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E' }}>
                                    ⚠️ This product is available for local (Pakistan) shipping only.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            {product.reviews?.length === 0 ? (
                                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No reviews yet. Be the first to review this product!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
                                    {product.reviews?.map((review: any) => (
                                        <div key={review.id} style={{ padding: '16px', background: '#F8F4EF', borderRadius: '12px', border: '1px solid #F0EAE0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>
                                                        {review.user?.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{review.user?.name}</p>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} size={11} style={{ color: s <= review.rating ? '#C9A84C' : '#E5E7EB', fill: s <= review.rating ? '#C9A84C' : '#E5E7EB' }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>{review.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Related products */}
                {related.length > 0 && (
                    <div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: '#1A1A1A', marginBottom: '24px' }}>
                            You May Also Like
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div >

            <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </>
    )
}