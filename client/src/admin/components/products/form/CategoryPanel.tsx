interface Props {
  categories:  any[]
  selectedId:  number | undefined
  onChange:    (id: number) => void
  error?:      string
}

export default function CategoryPanel({ categories, selectedId, onChange, error }: Props) {
  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
        Category *
      </h3>

      {categories.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No categories found. Add categories first.</p>
      ) : (
        <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {categories.map((cat: any) => (
            <div key={cat.id}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                padding: '7px 8px', borderRadius: '6px', margin: 0,
                fontWeight: '600', fontSize: '13px', color: '#1A1A1A',
                background: selectedId === cat.id ? '#FFFBEB' : 'transparent',
                border:     selectedId === cat.id ? '1px solid #FDE68A' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio"
                  name="categoryId"
                  checked={selectedId === cat.id}
                  onChange={() => onChange(cat.id)}
                  style={{ cursor: 'pointer', accentColor: '#C9A84C' }}
                />
                {cat.name}
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9CA3AF', fontWeight: '400' }}>
                  {cat._count?.products ?? 0}
                </span>
              </label>

              {cat.children?.map((child: any) => (
                <label key={child.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  padding: '6px 8px 6px 28px', borderRadius: '6px', margin: 0,
                  fontWeight: '400', fontSize: '13px', color: '#4B5563',
                  background: selectedId === child.id ? '#FFFBEB' : 'transparent',
                  border:     selectedId === child.id ? '1px solid #FDE68A' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="categoryId"
                    checked={selectedId === child.id}
                    onChange={() => onChange(child.id)}
                    style={{ cursor: 'pointer', accentColor: '#C9A84C' }}
                  />
                  ↳ {child.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-text" style={{ marginTop: '8px' }}>{error}</p>}
    </div>
  )
}