import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertTriangle } from 'lucide-react'

interface ProductImage {
  id:        number
  url:       string
  isPrimary: boolean
}

interface Props {
  images:          ProductImage[]
  savedProductId:  number | null
  uploading:       boolean
  onDrop:          (files: File[]) => void
  onRemove:        (id: number) => void
}

export default function ImagesSection({ images, savedProductId, uploading, onDrop, onRemove }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:  { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    onDrop,
    disabled: !savedProductId,
  })

  return (
    <div className="card">
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
        Product Gallery
      </h3>

      {!savedProductId && (
        <div className="alert alert-warning" style={{ marginBottom: '12px' }}>
          <AlertTriangle size={15} />
          <p style={{ fontSize: '12px' }}>Save the product first to upload images</p>
        </div>
      )}

      <div
        {...getRootProps()}
        style={{
          border:       `2px dashed ${isDragActive ? '#C9A84C' : '#E5E7EB'}`,
          borderRadius: '10px',
          padding:      '24px',
          textAlign:    'center',
          cursor:       savedProductId ? 'pointer' : 'not-allowed',
          background:   isDragActive ? '#FFFBEB' : '#F9FAFB',
          transition:   'all 0.2s',
          marginBottom: '12px',
          opacity:      savedProductId ? 1 : 0.6,
        }}
      >
        <input {...getInputProps()} />
        {uploading
          ? <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          : <>
              <Upload size={24} style={{ color: '#C9A84C', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Drag & drop or{' '}
                <span style={{ color: '#C9A84C', fontWeight: '600' }}>browse</span>
              </p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                Max 5MB — JPG, PNG, WebP
              </p>
            </>
        }
      </div>

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: img.isPrimary ? '2px solid #C9A84C' : '1px solid #E5E7EB' }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {img.isPrimary && (
                <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#C9A84C', color: '#1A1A1A', fontSize: '9px', fontWeight: '700', padding: '2px 5px', borderRadius: '4px' }}>
                  PRIMARY
                </span>
              )}
              <button
                onClick={() => onRemove(img.id)}
                style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: '#DC2626', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}