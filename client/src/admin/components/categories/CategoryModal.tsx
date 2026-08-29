import { X, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'

const schema = z.object({
  name:      z.string().min(2, 'Name must be at least 2 characters').optional().catch(undefined),
  slug:      z.string().optional().catch(undefined),
  parentId:  z.number().optional().nullable().catch(null),
  sortOrder: z.number().optional().catch(undefined),
  isActive:  z.boolean().catch(true),
}) as z.ZodType<FormData>

// Manually define FormData to ensure isActive is required in the form
type FormData = {
  name?: string
  slug?: string
  parentId?: number | null
  sortOrder?: number
  isActive: boolean
}

interface Props {
  editItem:   any
  topLevel:   any[]
  onClose:    () => void
  onSubmit:   (values: Partial<FormData>, editItem: any) => void
  isLoading:  boolean
}

export default function CategoryModal({ editItem, topLevel, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, parentId: null, name: '', slug: '', sortOrder: 0 },
  })

  useEffect(() => {
    if (editItem) {
      reset({
        name:      editItem.name,
        slug:      editItem.slug,
        parentId:  editItem.parentId ?? null,
        sortOrder: editItem.sortOrder ?? 0,
        isActive:  editItem.isActive,
      })
    }
  }, [editItem])

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: '#1A1A1A' }}>
            {editItem ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', borderRadius: '6px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(values, editItem))}>

          <div className="form-group">
            <label>Category Name *</label>
            <input
              {...register('name')}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Qalam, Inkpot, Art Paper"
              onChange={(e) => {
                register('name').onChange(e)
                if (!editItem) setValue('slug', generateSlug(e.target.value))
              }}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label>Slug</label>
            <input {...register('slug')} className="input" placeholder="auto-generated-from-name" />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              URL: /shop/<strong>{watch('slug') || 'slug'}</strong>
            </p>
          </div>

          <div className="form-group">
            <label>Parent Category</label>
            <select
              className="input"
              value={watch('parentId') ?? ''}
              onChange={(e) => setValue('parentId', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">None (Top-level)</option>
              {topLevel
                .filter((c: any) => c.id !== editItem?.id)
                .map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              }
            </select>
          </div>

          <div className="form-group">
            <label>Sort Order</label>
            <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="input" placeholder="0" min={0} />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Lower number = appears first</p>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#F9FAFB', borderRadius: '10px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Active</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Visible in store</p>
            </div>
            <div
              onClick={() => setValue('isActive', !watch('isActive'))}
              style={{ width: '44px', height: '24px', borderRadius: '999px', background: watch('isActive') ? '#C9A84C' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
            >
              <div style={{ position: 'absolute', top: '4px', left: watch('isActive') ? '22px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {isLoading
                ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                : <><Save size={15} />{editItem ? 'Save Changes' : 'Create Category'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}