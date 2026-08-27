interface Props {
  register: any
}

export default function TagsPanel({ register }: Props) {
  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>Tags</h3>
      <input
        {...register('tags')}
        className="input"
        placeholder="Beginner, Professional, Gift..."
      />
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
        Suggested: Gift, Handmade, Artisan, Collection
      </p>
    </div>
  )
}