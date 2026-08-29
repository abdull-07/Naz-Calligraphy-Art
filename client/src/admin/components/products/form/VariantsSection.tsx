import { Plus, Trash2 } from 'lucide-react'

interface Variant {
  id?:          number
  label:        string
  sku:          string
  price:        number
  comparePrice: number | null
  stockQty:     number
  isDefault:    boolean
}

interface Props {
  variants:      Variant[]
  hasVariants:   boolean
  onToggleMode:  () => void
  onAdd:         () => void
  onUpdate:      (index: number, key: keyof Variant, value: any) => void
  onRemove:      (index: number) => void
}

export default function VariantsSection({
  variants, hasVariants, onToggleMode, onAdd, onUpdate, onRemove
}: Props) {
  return (
    <div className="card">
      {/* Header */}
      <div style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        marginBottom:    '20px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize:   '17px',
            fontWeight: '700',
            color:      '#1A1A1A',
          }}>
            Pricing & Variants
          </h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
            {hasVariants
              ? 'Multiple options with individual pricing'
              : 'Single price and stock for this product'}
          </p>
        </div>

        {/* Toggle simple vs variant */}
        <label style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '8px',
          cursor:      'pointer',
          fontSize:    '13px',
          fontWeight:  '500',
          color:       '#374151',
          margin:      0,
          userSelect:  'none',
        }}>
          <span style={{ color: hasVariants ? '#9CA3AF' : '#1A1A1A', fontWeight: hasVariants ? '400' : '600' }}>
            Simple
          </span>
          <div
            onClick={onToggleMode}
            style={{
              width:         '40px',
              height:        '22px',
              borderRadius:  '999px',
              background:    hasVariants ? '#C9A84C' : '#E5E7EB',
              cursor:        'pointer',
              position:      'relative',
              transition:    'background 0.2s',
              flexShrink:    0,
            }}
          >
            <div style={{
              position:     'absolute',
              top:          '3px',
              left:         hasVariants ? '21px' : '3px',
              width:        '16px',
              height:       '16px',
              borderRadius: '50%',
              background:   '#FFFFFF',
              transition:   'left 0.2s',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ color: hasVariants ? '#1A1A1A' : '#9CA3AF', fontWeight: hasVariants ? '600' : '400' }}>
            Has Variants
          </span>
        </label>
      </div>

      {/* ── SIMPLE PRODUCT ──────────────────────────────────── */}
      {!hasVariants && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Regular Price (PKR) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position:   'absolute',
                left:       '12px',
                top:        '50%',
                transform:  'translateY(-50%)',
                fontSize:   '13px',
                color:      '#9CA3AF',
                fontWeight: '500',
              }}>
                Rs.
              </span>
              <input
                type="number"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="0.00"
                min={0}
                value={variants[0]?.price || ''}
                onChange={(e) => {
                  if (variants.length === 0) {
                    onAdd() // create default variant if none
                  }
                  onUpdate(0, 'price', Number(e.target.value))
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Sale Price (PKR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position:   'absolute',
                left:       '12px',
                top:        '50%',
                transform:  'translateY(-50%)',
                fontSize:   '13px',
                color:      '#9CA3AF',
                fontWeight: '500',
              }}>
                Rs.
              </span>
              <input
                type="number"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="0.00"
                min={0}
                value={variants[0]?.comparePrice || ''}
                onChange={(e) => {
                  if (variants.length === 0) onAdd()
                  onUpdate(0, 'comparePrice', Number(e.target.value) || null)
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>SKU</label>
            <input
              type="text"
              className="input"
              placeholder="NZ-001"
              value={variants[0]?.sku || ''}
              onChange={(e) => {
                if (variants.length === 0) onAdd()
                onUpdate(0, 'sku', e.target.value)
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Stock *</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              min={0}
              value={variants[0]?.stockQty || ''}
              onChange={(e) => {
                if (variants.length === 0) onAdd()
                onUpdate(0, 'stockQty', Number(e.target.value))
              }}
            />
          </div>
        </div>
      )}

      {/* ── VARIANT PRODUCT ─────────────────────────────────── */}
      {hasVariants && (
        <>
          {variants.length > 0 && (
            <div style={{
              display:             'grid',
              gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 36px',
              gap:                 '8px',
              padding:             '8px 0',
              borderBottom:        '1px solid #F3F4F6',
              marginBottom:        '8px',
            }}>
              {['Variant Name', 'SKU', 'Price (Rs.)', 'Stock', 'Sale Price', ''].map((h) => (
                <p key={h} style={{
                  fontSize:      '11px',
                  fontWeight:    '700',
                  color:         '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {h}
                </p>
              ))}
            </div>
          )}

          {variants.map((variant, index) => (
            <div
              key={index}
              style={{
                display:             'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 36px',
                gap:                 '8px',
                marginBottom:        '8px',
                alignItems:          'center',
              }}
            >
              <input
                className="input"
                placeholder="e.g. 1 Piece, 5 Pieces"
                value={variant.label}
                onChange={(e) => onUpdate(index, 'label', e.target.value)}
              />
              <input
                className="input"
                placeholder="NZ-001"
                value={variant.sku}
                onChange={(e) => onUpdate(index, 'sku', e.target.value)}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="0"
                value={variant.price || ''}
                onChange={(e) => onUpdate(index, 'price', Number(e.target.value))}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="0"
                value={variant.stockQty || ''}
                onChange={(e) => onUpdate(index, 'stockQty', Number(e.target.value))}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="0"
                value={variant.comparePrice || ''}
                onChange={(e) => onUpdate(index, 'comparePrice', Number(e.target.value) || null)}
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={{
                  background:   'none',
                  border:       'none',
                  cursor:       'pointer',
                  color:        '#DC2626',
                  padding:      '4px',
                  borderRadius: '6px',
                  display:      'flex',
                  transition:   'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '6px',
              background:     'none',
              border:         '1.5px dashed #C9A84C',
              borderRadius:   '8px',
              padding:        '10px 16px',
              cursor:         'pointer',
              color:          '#C9A84C',
              fontSize:       '14px',
              fontWeight:     '600',
              width:          '100%',
              justifyContent: 'center',
              transition:     'all 0.2s',
              marginTop:      '8px',
              fontFamily:     'Inter, sans-serif',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FFFBEB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <Plus size={15} />
            Add Another Variant
          </button>
        </>
      )}
    </div>
  )
}