import { Link } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

interface Props {
  page: string
}

export default function ComingSoon({ page }: Props) {
  return (
    <>
      <Helmet>
        <title>{page} — Naz Calligraphy Art</title>
      </Helmet>

      <div style={{
        minHeight:       '70vh',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '60px 24px',
        textAlign:       'center',
        background:      '#FFFFFF',
      }}>
        {/* Icon */}
        <div style={{
          width:          '80px',
          height:         '80px',
          background:     'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          borderRadius:   '20px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   '24px',
          boxShadow:      '0 8px 24px rgba(201,168,76,0.2)',
        }}>
          <Clock size={36} style={{ color: '#C9A84C' }} />
        </div>

        {/* Calligraphy decorative text */}
        <p style={{
          fontFamily:   'Playfair Display, serif',
          fontSize:     '13px',
          fontWeight:   '600',
          color:        '#C9A84C',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Coming Soon
        </p>

        <h1 style={{
          fontFamily:   'Playfair Display, serif',
          fontSize:     'clamp(28px, 5vw, 44px)',
          fontWeight:   '700',
          color:        '#1A1A1A',
          marginBottom: '16px',
          lineHeight:   '1.2',
        }}>
          {page}
        </h1>

        <p style={{
          fontSize:     '16px',
          color:        '#6B7280',
          maxWidth:     '420px',
          lineHeight:   '1.7',
          marginBottom: '40px',
        }}>
          We're working hard to bring you this page. In the meantime, explore our calligraphy collection.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/shop"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '8px',
              background:     'linear-gradient(135deg, #C9A84C, #A8893A)',
              color:          '#1A1A1A',
              padding:        '13px 28px',
              borderRadius:   '12px',
              textDecoration: 'none',
              fontWeight:     '700',
              fontSize:       '15px',
              boxShadow:      '0 4px 14px rgba(201,168,76,0.35)',
              transition:     'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Browse Shop
          </Link>

          <Link
            to="/"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '8px',
              background:     '#F3F4F6',
              color:          '#374151',
              padding:        '13px 24px',
              borderRadius:   '12px',
              textDecoration: 'none',
              fontWeight:     '600',
              fontSize:       '15px',
              transition:     'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
          >
            <ArrowLeft size={16} />
            Go Home
          </Link>
        </div>

        {/* Newsletter teaser */}
        <div style={{
          marginTop:     '48px',
          padding:       '24px 32px',
          background:    '#F8F4EF',
          borderRadius:  '16px',
          maxWidth:      '420px',
          border:        '1px solid #F0EAE0',
        }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px' }}>
            Get notified when it launches
          </p>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>
            Subscribe to our newsletter for updates
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
              onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <button
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A8893A)', color: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </>
  )
}