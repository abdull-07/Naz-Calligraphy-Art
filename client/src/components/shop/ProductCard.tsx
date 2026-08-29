import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import toast from 'react-hot-toast'

interface Props {
  product: any
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const variant = product.variants?.[0]
  const image = product.images?.[0]?.url
  const price = Number(variant?.price ?? 0)
  const compare = Number(variant?.comparePrice ?? 0)
  const discount = compare > price ? Math.round(((compare - price) / compare) * 100) : 0
  const inStock = variant?.stockStatus !== 'OUT_OF_STOCK'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variant) { toast.error('Product unavailable'); return }
    if (!inStock) { toast.error('Out of stock'); return }

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: variant.label,
      price,
      comparePrice: compare > 0 ? compare : null,
      quantity: 1,
      image: image ?? null,
      slug: product.slug,
      localShippingOnly: product.localShippingOnly,
      freeShipping: product.freeShipping ?? false,   // ← add
      weightKg: product.weightKg ?? 0.5,          // ← add (default 0.5 KG)
    })

    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Link
      to={`/shop/${product.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #F0EAE0',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
          e.currentTarget.style.borderColor = '#C9A84C'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = '#F0EAE0'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#F8F4EF' }}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px', opacity: 0.15 }}>🖋</span>
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {discount > 0 && (
              <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span style={{ background: '#C9A84C', color: '#1A1A1A', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                Featured
              </span>
            )}
            {!inStock && (
              <span style={{ background: '#1A1A1A', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toast('Wishlist coming soon!') }}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#FFFFFF', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#9CA3AF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
          >
            <Heart size={15} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <p style={{ fontSize: '11px', color: '#C9A84C', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {product.category?.name}
          </p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>

          {/* Price + Add to cart */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>
                Rs. {price.toLocaleString()}
              </span>
              {compare > price && (
                <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' }}>
                  Rs. {compare.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              style={{
                background: inStock ? 'linear-gradient(135deg, #C9A84C, #A8893A)' : '#F3F4F6',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: inStock ? 'pointer' : 'not-allowed',
                color: inStock ? '#1A1A1A' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <ShoppingCart size={14} />
              {inStock ? 'Add' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}