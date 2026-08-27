import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Shield, Truck, Award, MessageCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { shopService } from '../services/shop.service'
import ProductCard from '../components/shop/ProductCard'

export default function HomePage() {
    const { data: featuredData } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => shopService.getProducts({ featured: 'true', limit: '8' as any }),
    })

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: shopService.getCategories,
    })

    const featured = featuredData?.data ?? []

    return (
        <>
            <Helmet>
                <title>Naz Calligraphy Art — Premium Arabic Calligraphy Supplies Pakistan</title>
                <meta name="description" content="Shop premium Arabic calligraphy supplies in Pakistan. Handcrafted qalam, authentic inks, art paper and more." />
            </Helmet>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section style={{
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 60%, #1A1A1A 100%)',
                padding: 'clamp(60px, 12vw, 120px) 24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
                            radial-gradient(circle at 70% 30%, rgba(45,125,154,0.08) 0%, transparent 60%)`,
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <p style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#C9A84C',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                    }}>
                        Pakistan's Premium Calligraphy Store
                    </p>

                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(36px, 6vw, 68px)',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        lineHeight: '1.15',
                        marginBottom: '20px',
                    }}>
                        The Art of{' '}
                        <span style={{ color: '#C9A84C' }}>Arabic</span>
                        {' '}Calligraphy
                    </h1>

                    <p style={{
                        fontSize: '16px',
                        color: '#9CA3AF',
                        lineHeight: '1.8',
                        marginBottom: '36px',
                        maxWidth: '520px',
                        margin: '0 auto 36px',
                    }}>
                        Handcrafted qalam, premium inks, and fine art supplies for calligraphy artists across Pakistan and beyond.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to="/shop"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #C9A84C, #A8893A)',
                                color: '#1A1A1A',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '15px',
                                boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Shop Now
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/about"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#FFFFFF',
                                padding: '14px 28px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '15px',
                                border: '1px solid rgba(255,255,255,0.12)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                            Our Story
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── TRUST STRIP ──────────────────────────────────────── */}
            <section style={{ background: '#F8F4EF', borderBottom: '1px solid #F0EAE0', padding: '20px 24px' }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {[
                        { icon: Truck, text: 'Free shipping over Rs. 2,000' },
                        { icon: Shield, text: '100% authentic products' },
                        { icon: Award, text: 'Premium quality guaranteed' },
                        { icon: MessageCircle, text: 'WhatsApp support available' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                            <Icon size={18} style={{ color: '#C9A84C', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#4B5563' }}>{text}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CATEGORIES ───────────────────────────────────────── */}
            {categories.length > 0 && (
                <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Browse</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '700', color: '#1A1A1A' }}>
                                Shop by Category
                            </h2>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '16px',
                        }}>
                            {categories.filter((c: any) => !c.parentId).slice(0, 7).map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    to={`/shop?category=${cat.slug}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            borderRadius: '16px',
                                            padding: '24px 16px',
                                            textAlign: 'center',
                                            border: '1px solid #F0EAE0',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#C9A84C'
                                            e.currentTarget.style.transform = 'translateY(-3px)'
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.15)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#F0EAE0'
                                            e.currentTarget.style.transform = 'translateY(0)'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }}
                                    >
                                        {cat.imageUrl ? (
                                            <img src={cat.imageUrl} alt={cat.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
                                        ) : (
                                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🖋</div>
                                        )}
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{cat.name}</p>
                                        {cat._count?.products > 0 && (
                                            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{cat._count.products} items</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
            <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', background: '#F8F4EF' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Featured</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '700', color: '#1A1A1A' }}>
                                Popular Products
                            </h2>
                        </div>
                        <Link
                            to="/shop"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C9A84C', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                        >
                            View All <ArrowRight size={15} />
                        </Link>
                    </div>

                    {featured.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                            <p>No featured products yet. Add products from the admin panel.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '20px',
                        }}>
                            {featured.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px', textAlign: 'center', background: '#FFFFFF' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '700', color: '#1A1A1A', marginBottom: '16px' }}>
                        Questions? We're Here
                    </h2>
                    <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.7', marginBottom: '32px' }}>
                        Our team is available on WhatsApp for product recommendations, custom orders, and shipping queries.
                    </p>
                    <a
                        href="https://wa.me/923001234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25D366', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 16px rgba(37,211,102,0.3)', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <MessageCircle size={20} />
                        Chat on WhatsApp
                    </a>
                </div>
            </section>
        </>
    )
}