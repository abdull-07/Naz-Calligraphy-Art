import { Trash2 } from 'lucide-react'

interface Props {
  onConfirm:  () => void
  onCancel:   () => void
  isLoading:  boolean
}

export default function DeleteConfirmModal({ onConfirm, onCancel, isLoading }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Trash2 size={24} style={{ color: '#DC2626' }} />
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Delete Category?
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            This will permanently delete the category. Products in this category will need to be reassigned.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
              : <><Trash2 size={14} />Delete</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}