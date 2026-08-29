import { Tag, ToggleRight, FolderOpen } from 'lucide-react'

interface Props {
  total:    number
  active:   number
  subCount: number
}

export default function CategoryStats({ total, active, subCount }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[
        { label: 'Total Categories', value: total,    icon: Tag,         color: '#C9A84C', bg: '#FFFBEB' },
        { label: 'Active',           value: active,   icon: ToggleRight, color: '#16A34A', bg: '#DCFCE7' },
        { label: 'Subcategories',    value: subCount, icon: FolderOpen,  color: '#2D7D9A', bg: '#CCFBF1' },
      ].map((stat) => (
        <div key={stat.label} className="kpi-card">
          <div className="kpi-icon" style={{ background: stat.bg }}>
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>{stat.label}</p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#1A1A1A', lineHeight: 1 }}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}