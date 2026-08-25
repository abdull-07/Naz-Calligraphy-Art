import { Save, Eye } from 'lucide-react'

interface Props {
  status:         string
  isSubmitting:   boolean
  isEdit:         boolean
  onSaveDraft:    () => void
  onPublish:      () => void
  onStatusChange: (val: string) => void
}

export default function PublishPanel({ status, isSubmitting, isEdit, onSaveDraft, onPublish, onStatusChange }: Props) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700' }}>Publish</h3>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: status === 'ACTIVE' ? '#166534' : '#6B7280' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: status === 'ACTIVE' ? '#16A34A' : '#9CA3AF' }} />
          {status === 'ACTIVE' ? 'Active' : 'Draft'}
        </span>
      </div>

      <div className="form-group">
        <label>Product Status</label>
        <select className="input" value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button type="button" onClick={onSaveDraft} disabled={isSubmitting} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <Save size={15} />
          Save Draft
        </button>
        <button type="button" onClick={onPublish} disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {isSubmitting
            ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
            : <><Eye size={15} />{isEdit ? 'Save Changes' : 'Publish Product'}</>
          }
        </button>
      </div>
    </div>
  )
}