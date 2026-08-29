import { Trash2 } from 'lucide-react'

interface Props {
  count:      number
  onDelete:   () => void
  onClear:    () => void
  isDeleting: boolean
}

export default function ProductBulkBar({ count, onDelete, onClear, isDeleting }: Props) {
  if (count === 0) return null

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '12px',
      padding:      '12px 16px',
      background:   '#FEF3C7',
      borderRadius: '10px',
      marginBottom: '12px',
      border:       '1px solid #FDE68A',
    }}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
        {count} products selected
      </span>
      <button
        className="btn btn-danger btn-sm"
        onClick={onDelete}
        disabled={isDeleting}
      >
        <Trash2 size={14} />
        Delete Selected
      </button>
      <button className="btn btn-secondary btn-sm" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}