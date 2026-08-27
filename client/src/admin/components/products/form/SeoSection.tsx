import { useState } from 'react'

interface Props {
  register: any
}

export default function SeoSection({ register }: Props) {
  const [titleLen, setTitleLen] = useState(0)
  const [descLen,  setDescLen]  = useState(0)

  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>
        Search Engine Optimization
      </h3>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ margin: 0 }}>Meta Title</label>
          <span style={{ fontSize: '12px', color: titleLen > 55 ? '#DC2626' : '#9CA3AF' }}>
            {titleLen} / 60
          </span>
        </div>
        <input
          {...register('seoTitle', { onChange: (e: any) => setTitleLen(e.target.value.length) })}
          className="input"
          placeholder="Naz Calligraphy — Premium Bamboo Qalam Set"
        />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ margin: 0 }}>Meta Description</label>
          <span style={{ fontSize: '12px', color: descLen > 150 ? '#DC2626' : '#9CA3AF' }}>
            {descLen} / 160
          </span>
        </div>
        <textarea
          {...register('seoDescription', { onChange: (e: any) => setDescLen(e.target.value.length) })}
          className="input"
          rows={3}
          placeholder="Discover the finest handmade bamboo qalam sets..."
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  )
}