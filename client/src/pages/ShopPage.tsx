import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { shopService } from '../services/shop.service'
import ProductCard from '../components/shop/ProductCard'

export default function ShopPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const search = searchParams.get('search') ?? ''
    const category = searchParams.get('category') ?? ''
    const sort = searchParams.get('sort') ?? 'newest'
    const inStock = searchParams.get('inStock') ?? ''
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 20

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) params.set(key, value)
        else params.delete(key)
        params.delete('page')
        setSearchParams(params)
    }

    const { data, isLoading } = useQuery({
        queryKey: ['shop-products', { search, category, sort, inStock, page }],
        queryFn: () => shopService.getProducts({ search, category, sort, inStock, page, limit }),
    })

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: shopService.getCategories,
    })

    const products = data?.data ?? []
    const meta = data?.meta ?? { total: 0, totalPages: 1 }

    const sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Price: Low–High', value: 'price_asc' },
        { label: 'Price: High–Low', value: 'price_desc' },
        { label: 'Oldest', value: 'oldest' },
    ]

    return (
        <>
            <Helmet>
                <title>Shop — Naz Calligraphy Art</title>
                <meta name="description" content="Browse our complete collection of Arabic calligraphy supplies." />
            </Helmet>

            {/* Page hero */}
            <div style={{
                background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
                padding: '40px 24px',
                textAlign: 'center',
            }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
                    Our Collection
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
                    {meta.total} products available
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                    {/* ── SIDEBAR FILTERS ───────────────────────────────── */}
                    <aside style={{
                        width: '220px',
                        flexShrink: 0,
                        display: 'block',
                    }}
                        className="shop-sidebar"
                    >
                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F0EAE0', padding: '20px', position: 'sticky', top: '88px' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px' }}>
                                Filters
                            </h3>

                            {/* Search */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Search</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        value={search}
                                        onChange={(e) => updateParam('search', e.target.value)}
                                        placeholder="Search products..."
                                        style={{ width: '100%', padding: '9px 10px 9px 30px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                                        onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
                                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Category</label>
                                <button
                                    onClick={() => updateParam('category', '')}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '7px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: !category ? '#FEF3C7' : 'none',
                                        color: !category ? '#92400E' : '#6B7280',
                                        fontWeight: !category ? '600' : '400',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        marginBottom: '2px',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    All Categories
                                </button>
                                {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                                    <div key={cat.id}>
                                        <button
                                            onClick={() => updateParam('category', cat.slug)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '7px 10px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: category === cat.slug ? '#FEF3C7' : 'none',
                                                color: category === cat.slug ? '#92400E' : '#374151',
                                                fontWeight: category === cat.slug ? '600' : '500',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                fontFamily: 'Inter, sans-serif',
                                                marginBottom: '2px',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {cat.name}
                                        </button>
                                        {cat.children?.map((child: any) => (
                                            <button
                                                key={child.id}
                                                onClick={() => updateParam('category', child.slug)}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '6px 10px 6px 22px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: category === child.slug ? '#FEF3C7' : 'none',
                                                    color: category === child.slug ? '#92400E' : '#6B7280',
                                                    fontWeight: category === child.slug ? '600' : '400',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Inter, sans-serif',
                                                    marginBottom: '2px',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                ↳ {child.name}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* In Stock */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Availability</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '13px', color: '#374151' }}>
                                    <input
                                        type="checkbox"
                                        checked={inStock === 'true'}
                                        onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                                        style={{ accentColor: '#C9A84C' }}
                                    />
                                    In Stock Only
                                </label>
                            </div>

                            {/* Reset */}
                            {(search || category || inStock) && (
                                <button
                                    onClick={() => setSearchParams({})}
                                    style={{ width: '100%', padding: '9px', background: '#FEF2F2', border: 'none', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── PRODUCTS GRID ─────────────────────────────────── */}
                    <div style={{ flex: 1 }}>

                        {/* Sort bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                {meta.total} products
                                {category && <span style={{ color: '#C9A84C', fontWeight: '600' }}> in {category}</span>}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Sort:</label>
                                <select
                                    value={sort}
                                    onChange={(e) => updateParam('sort', e.target.value)}
                                    style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} style={{ background: '#F3F4F6', borderRadius: '16px', aspectRatio: '1', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9CA3AF' }}>
                                <p style={{ fontSize: '48px', marginBottom: '16px' }}>🖋</p>
                                <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No products found</p>
                                <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
                                <button onClick={() => setSearchParams({})} style={{ marginTop: '16px', padding: '10px 20px', background: '#C9A84C', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {products.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '40px' }}>
                                <button
                                    onClick={() => updateParam('page', String(page - 1))}
                                    disabled={page === 1}
                                    className="page-btn"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => updateParam('page', String(p))}
                                        className={`page-btn ${page === p ? 'active' : ''}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => updateParam('page', String(page + 1))}
                                    disabled={page === meta.totalPages}
                                    className="page-btn"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .shop-sidebar { display: none; }
        }
      `}</style>
        </>
    )
}