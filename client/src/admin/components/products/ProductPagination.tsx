import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page:       number
  totalPages: number
  total:      number
  limit:      number
  onChange:   (page: number) => void
}

export default function ProductPagination({ page, totalPages, total, limit, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '16px 20px',
      borderTop:       '1px solid #F3F4F6',
    }}>
      <p style={{ fontSize: '13px', color: '#6B7280' }}>
        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} products
      </p>
      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`page-btn ${page === p ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        {totalPages > 5 && <span style={{ padding: '0 4px', color: '#9CA3AF' }}>...</span>}
        <button
          className="page-btn"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}