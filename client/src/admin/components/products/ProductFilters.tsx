    import { Search } from 'lucide-react'

interface Props {
  search:      string
  category:    string
  status:      string
  sort:        string
  categories:  any[]
  onChange:    (key: string, value: string) => void
}

export default function ProductFilters({
  search, category, status, sort, categories, onChange
}: Props) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px',
            top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF',
          }} />
          <input
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        <select
          className="input"
          style={{ width: '180px' }}
          value={category}
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="">Category: All</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        <select
          className="input"
          style={{ width: '160px' }}
          value={status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className="input"
          style={{ width: '160px' }}
          value={sort}
          onChange={(e) => onChange('sort', e.target.value)}
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="price_asc">Price: Low–High</option>
          <option value="price_desc">Price: High–Low</option>
        </select>
      </div>
    </div>
  )
}