import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Copy, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE:   { label: 'Active',   color: '#166534', dot: '#16A34A' },
  DRAFT:    { label: 'Draft',    color: '#6B7280', dot: '#9CA3AF' },
  ARCHIVED: { label: 'Archived', color: '#991B1B', dot: '#DC2626' },
}

const stockInfo = (qty: number, status: string) => {
  if (status === 'OUT_OF_STOCK' || qty === 0) return { label: 'OUT OF STOCK', color: '#DC2626' }
  if (status === 'LOW_STOCK')                  return { label: 'LOW STOCK',    color: '#D97706' }
  return                                              { label: 'IN STOCK',     color: '#16A34A' }
}

interface Props {
  products:   any[]
  selected:   number[]
  isLoading:  boolean
  onToggle:   (id: number) => void
  onToggleAll: () => void
  onDelete:   (id: number) => void
  allSelected: boolean
}

export default function ProductsTable({
  products, selected, isLoading, onToggle,
  onToggleAll, onDelete, allSelected,
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} style={{ cursor: 'pointer' }} />
            </th>
            <th>Product</th>
            <th>Category</th>
            <th>Price (PKR)</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={7}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner" />
              </div>
            </td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={7}>
              <div className="empty-state">
                <Package size={40} style={{ color: '#E5E7EB' }} />
                <p style={{ fontWeight: '600' }}>No products found</p>
                <p style={{ fontSize: '13px' }}>Try adjusting your filters</p>
              </div>
            </td></tr>
          ) : products.map((product: any) => {
            const variant    = product.variants?.[0]
            const price      = variant?.price ?? 0
            const stock      = variant?.stockQty ?? 0
            const stockSt    = variant?.stockStatus ?? 'OUT_OF_STOCK'
            const sInfo      = stockInfo(stock, stockSt)
            const image      = product.images?.[0]?.url
            const pStatus    = statusConfig[product.status] ?? statusConfig.DRAFT
            const isSelected = selected.includes(product.id)

            return (
              <tr key={product.id} style={{ background: isSelected ? '#FFFBEB' : undefined }}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(product.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '8px',
                      overflow: 'hidden', background: '#F3F4F6', flexShrink: 0,
                      border: '1px solid #E5E7EB',
                    }}>
                      {image
                        ? <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={18} style={{ color: '#D1D5DB' }} />
                          </div>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A1A1A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                        {variant?.sku ?? 'No SKU'}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <span style={{ fontSize: '12px', background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: '999px', fontWeight: '500' }}>
                    {product.category?.name ?? '—'}
                  </span>
                </td>

                <td>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    Rs. {Number(price).toLocaleString()}
                  </span>
                  {variant?.comparePrice && (
                    <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' }}>
                      Rs. {Number(variant.comparePrice).toLocaleString()}
                    </span>
                  )}
                </td>

                <td>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: sInfo.color }}>{stock}</p>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: sInfo.color, letterSpacing: '0.05em' }}>{sInfo.label}</p>
                </td>

                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: pStatus.color }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: pStatus.dot, flexShrink: 0 }} />
                    {pStatus.label}
                  </span>
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[
                      { icon: Edit2,  title: 'Edit',      action: () => navigate(`/admin/products/${product.id}/edit`), hoverBg: '#EFF6FF', hoverColor: '#2563EB' },
                      { icon: Copy,   title: 'Duplicate', action: () => toast('Duplicate coming soon'),                 hoverBg: '#F0FDF4', hoverColor: '#16A34A' },
                      { icon: Trash2, title: 'Delete',    action: () => onDelete(product.id),                          hoverBg: '#FEF2F2', hoverColor: '#DC2626' },
                    ].map(({ icon: Icon, title, action, hoverBg, hoverColor }) => (
                      <button
                        key={title}
                        title={title}
                        onClick={action}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none';  e.currentTarget.style.color = '#6B7280' }}
                      >
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}