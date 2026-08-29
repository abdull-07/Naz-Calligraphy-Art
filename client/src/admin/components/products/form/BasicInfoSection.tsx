interface Props {
  register:  any
  errors:    any
  setValue:  any
  isEdit:    boolean
  slugWatch: string
}

export default function BasicInfoSection({ register, errors }: Props) {
  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>
        Basic Information
      </h3>

      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            {...register('name')}
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g., Premium Bamboo Qalam Set"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label>Slug</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
              /shop/
            </span>
            <input
              {...register('slug')}
              className="input"
              style={{ paddingLeft: '48px' }}
              placeholder="auto-generated"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          {...register('description')}
          className="input"
          rows={4}
          placeholder="Describe this product..."
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  )
}