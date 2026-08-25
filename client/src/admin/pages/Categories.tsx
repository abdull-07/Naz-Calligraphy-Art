import { useState }                         from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus }                             from 'lucide-react'
import toast                                from 'react-hot-toast'
import { categoryService }                  from '../services/category.service'
import CategoryStats                        from '../components/categories/CategoryStats'
import CategoryRow                          from '../components/categories/CategoryRow'
import CategoryModal                        from '../components/categories/CategoryModal'
import DeleteConfirmModal                   from '../components/categories/DeleteConfirmModal'

export default function Categories() {
  const queryClient = useQueryClient()

  const [modalOpen,     setModalOpen]     = useState(false)
  const [editItem,      setEditItem]      = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [expandedIds,   setExpandedIds]   = useState<number[]>([])

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn:  categoryService.getAll,
  })

  const topLevel = categories.filter((c: any) => !c.parentId)

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-all'] }); toast.success('Category created!'); closeModal() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => categoryService.update(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-all'] }); toast.success('Category updated!'); closeModal() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-all'] }); toast.success('Deleted!'); setDeleteConfirm(null) },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to delete'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => categoryService.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories-all'] }),
    onError:   () => toast.error('Failed to update status'),
  })

  const openAdd = (parentId?: number) => {
    setEditItem(parentId ? { parentId } : null)
    setModalOpen(true)
  }

  const openEdit = (cat: any) => {
    setEditItem(cat)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditItem(null)
  }

  const toggleExpand = (id: number) =>
    setExpandedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const handleModalSubmit = (values: any, item: any) => {
    const payload = { ...values, slug: values.slug || values.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'), parentId: values.parentId || undefined }
    if (item && item.id) {
      updateMutation.mutate({ id: item.id, payload })
    } else {
      createMutation.mutate({ ...payload, ...(item?.parentId && { parentId: item.parentId }) })
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage product categories and subcategories</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd()}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <CategoryStats
        total={categories.length}
        active={categories.filter((c: any) => c.isActive).length}
        subCount={categories.filter((c: any) => c.parentId).length}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 120px', gap: '8px', padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
          {['Category', 'Slug', 'Products', 'Status', 'Actions'].map((h) => (
            <p key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontWeight: '600' }}>No categories yet</p>
            <button className="btn btn-primary btn-sm" onClick={() => openAdd()}>
              <Plus size={14} />Add Category
            </button>
          </div>
        ) : topLevel.map((cat: any) => {
          const isExpanded = expandedIds.includes(cat.id)
          const children   = categories.filter((c: any) => c.parentId === cat.id)
          return (
            <div key={cat.id}>
              <CategoryRow
                cat={cat} isParent isExpanded={isExpanded} hasChildren={children.length > 0}
                onToggleExpand={() => toggleExpand(cat.id)}
                onEdit={() => openEdit(cat)}
                onDelete={() => setDeleteConfirm(cat.id)}
                onToggleActive={() => toggleMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
                onAddChild={() => openAdd(cat.id)}
              />
              {isExpanded && children.map((child: any) => (
                <CategoryRow
                  key={child.id} cat={child} isParent={false} isExpanded={false} hasChildren={false}
                  onToggleExpand={() => {}}
                  onEdit={() => openEdit(child)}
                  onDelete={() => setDeleteConfirm(child.id)}
                  onToggleActive={() => toggleMutation.mutate({ id: child.id, isActive: !child.isActive })}
                  onAddChild={() => {}}
                />
              ))}
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <CategoryModal
          editItem={editItem?.id ? editItem : null}
          topLevel={topLevel}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => deleteMutation.mutate(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}