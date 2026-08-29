interface Props {
  isFeatured:        boolean
  localShippingOnly: boolean
  freeShipping:      boolean
  weightKg:          number | null
  onToggle:          (key: 'isFeatured' | 'localShippingOnly' | 'freeShipping') => void
  onWeightChange:    (value: number | null) => void
}

export default function OptionsPanel({
  isFeatured, localShippingOnly, freeShipping,
  weightKg, onToggle, onWeightChange,
}: Props) {
  const toggles = [
    { label: 'Local Shipping Only',  key: 'localShippingOnly' as const, value: localShippingOnly, desc: 'Only ships within Pakistan' },
    { label: 'Featured Product',     key: 'isFeatured'        as const, value: isFeatured,        desc: 'Show on homepage carousel' },
    { label: 'Free Shipping',        key: 'freeShipping'      as const, value: freeShipping,      desc: 'No shipping charge for this product' },
  ]

  return (
    <div className="card">
      <h3 style={{
        fontFamily:   'Playfair Display, serif',
        fontSize:     '16px',
        fontWeight:   '700',
        marginBottom: '16px',
      }}>
        Options & Shipping
      </h3>

      {/* Weight input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display:      'block',
          fontSize:     '13px',
          fontWeight:   '600',
          color:        '#374151',
          marginBottom: '6px',
        }}>
          Product Weight (KG)
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
            value={weightKg ?? ''}
            onChange={(e) =>
              onWeightChange(e.target.value ? Number(e.target.value) : null)
            }
            style={{ paddingRight: '40px' }}
          />
          <span style={{
            position:  'absolute',
            right:     '12px',
            top:       '50%',
            transform: 'translateY(-50%)',
            fontSize:  '12px',
            color:     '#9CA3AF',
            fontWeight: '500',
          }}>
            KG
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
          Used to calculate shipping cost at checkout
        </p>
      </div>

      <div className="divider" />

      {/* Toggles */}
      {toggles.map((opt) => (
        <div
          key={opt.key}
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            padding:         '10px 0',
            borderBottom:    '1px solid #F3F4F6',
          }}
        >
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#374151', margin: 0 }}>
              {opt.label}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
              {opt.desc}
            </p>
          </div>
          <div
            onClick={() => onToggle(opt.key)}
            style={{
              width:         '40px',
              height:        '22px',
              borderRadius:  '999px',
              background:    opt.value ? '#C9A84C' : '#E5E7EB',
              cursor:        'pointer',
              position:      'relative',
              transition:    'background 0.2s',
              flexShrink:    0,
            }}
          >
            <div style={{
              position:     'absolute',
              top:          '3px',
              left:         opt.value ? '21px' : '3px',
              width:        '16px',
              height:       '16px',
              borderRadius: '50%',
              background:   '#FFFFFF',
              transition:   'left 0.2s',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}