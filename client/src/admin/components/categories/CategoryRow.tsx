import { Plus, Edit2, Trash2, ChevronRight, Tag } from 'lucide-react'

interface Props {
  cat:            any
  isParent:       boolean
  isExpanded:     boolean
  hasChildren:    boolean
  onToggleExpand: () => void
  onEdit:         () => void
  onDelete:       () => void
  onToggleActive: () => void
  onAddChild:     () => void
}

export default function CategoryRow({
  cat, isParent, isExpanded, hasChildren,
  onToggleExpand, onEdit, onDelete, onToggleActive, onAddChild,
}: Props) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 120px', gap: '8px', padding: '14px 20px', borderBottom: '1px solid #F9FAFB', alignItems: 'center', background: isParent ? '#FFFFFF' : '#FAFAFA', transition: 'background 0.15s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = isParent ? '#FAFAFA' : '#F5F5F5'}
      onMouseLeave={(e) => e.currentTarget.style.background = isParent ? '#FFFFFF' : '#FAFAFA'}
    >

      {/* Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isParent && (
          <div style={{ width: '24px', flexShrink: 0 }}>
            <div style={{ width: '16px', height: '16px', borderLeft: '2px solid #E5E7EB', borderBottom: '2px solid #E5E7EB', borderRadius: '0 0 0 4px', marginLeft: '8px' }} />
          </div>
        )}

        {isParent && hasChildren ? (
          <button onClick={onToggleExpand} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#6B7280', borderRadius: '4px', flexShrink: 0 }}>
            <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
        ) : isParent ? (
          <div style={{ width: '20px', flexShrink: 0 }} />
        ) : null}

        <div style={{ width: '32px', height: '32px', background: isParent ? '#FEF3C7' : '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {cat.imageUrl
            ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            : <Tag size={14} style={{ color: isParent ? '#92400E' : '#9CA3AF' }} />
          }
        </div>

        <div>
          <p style={{ fontWeight: isParent ? '700' : '500', fontSize: '14px', color: '#1A1A1A' }}>
            {cat.name}
          </p>
          {hasChildren && (
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
              {cat.children?.length ?? 0} subcategories
            </p>
          )}
        </div>
      </div>

      {/* Slug */}
      <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {cat.slug}
      </p>

      {/* Products */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{cat._count?.products ?? 0}</span>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>products</span>
      </div>

      {/* Toggle */}
      <div
        onClick={onToggleActive}
        title={cat.isActive ? 'Click to deactivate' : 'Click to activate'}
        style={{ width: '40px', height: '22px', borderRadius: '999px', background: cat.isActive ? '#C9A84C' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
      >
        <div style={{ position: 'absolute', top: '3px', left: cat.isActive ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isParent && (
          <button onClick={onAddChild} title="Add subcategory"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.color = '#16A34A' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#6B7280' }}
          >
            <Plus size={15} />
          </button>
        )}
        <button onClick={onEdit} title="Edit"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#6B7280' }}
        >
          <Edit2 size={15} />
        </button>
        <button onClick={onDelete} title="Delete"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#6B7280' }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}