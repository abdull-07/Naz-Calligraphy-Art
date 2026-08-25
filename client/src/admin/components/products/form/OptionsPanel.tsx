interface Props {
  isFeatured:        boolean
  localShippingOnly: boolean
  onToggle:          (key: 'isFeatured' | 'localShippingOnly') => void
}

export default function OptionsPanel({ isFeatured, localShippingOnly, onToggle }: Props) {
  const options = [
    { label: 'Local Shipping Only', key: 'localShippingOnly' as const, value: localShippingOnly },
    { label: 'Featured Product',    key: 'isFeatured'        as const, value: isFeatured        },
  ]

  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>Options</h3>
      {options.map((opt) => (
        <div key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
          <label style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
            {opt.label}
          </label>
          <div
            onClick={() => onToggle(opt.key)}
            style={{ width: '40px', height: '22px', borderRadius: '999px', background: opt.value ? '#C9A84C' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
          >
            <div style={{ position: 'absolute', top: '3px', left: opt.value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}