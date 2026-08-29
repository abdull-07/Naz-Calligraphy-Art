import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'

export default function Navbar() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  const navigate    = useNavigate()
  const itemCount   = useCartStore((s) => s.itemCount)

  const navLinks = [
    { label: 'Shop',     path: '/shop' },
    { label: 'About',    path: '/about' },
    { label: 'Blog',     path: '/blog' },
    { label: 'Contact',  path: '/contact' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  return (
    <>
      <nav style={{
        background:    '#FFFFFF',
        borderBottom:  '1px solid #F0EAE0',
        position:      'sticky',
        top:           0,
        zIndex:        50,
        boxShadow:     '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth:        '1200px',
          margin:          '0 auto',
          padding:         '0 24px',
          height:          '68px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width:          '38px',
              height:         '38px',
              background:     'linear-gradient(135deg, #C9A84C, #A8893A)',
              borderRadius:   '10px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 4px 12px rgba(201,168,76,0.3)',
            }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>N</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.2' }}>
                Naz Calligraphy
              </p>
              <p style={{ fontSize: '10px', color: '#C9A84C', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Art & Supplies
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  fontSize:       '14px',
                  fontWeight:     '500',
                  color:          '#374151',
                  transition:     'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F4EF'; e.currentTarget.style.color = '#C9A84C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#6B7280' }}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/account/wishlist')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#6B7280', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F4EF'; e.currentTarget.style.color = '#C9A84C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#6B7280' }}
            >
              <Heart size={20} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '6px',
                background:     'linear-gradient(135deg, #C9A84C, #A8893A)',
                color:          '#1A1A1A',
                borderRadius:   '10px',
                padding:        '8px 16px',
                textDecoration: 'none',
                fontWeight:     '600',
                fontSize:       '14px',
                position:       'relative',
                boxShadow:      '0 4px 12px rgba(201,168,76,0.3)',
                transition:     'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <ShoppingCart size={17} />
              Cart
              {itemCount() > 0 && (
                <span style={{
                  position:       'absolute',
                  top:            '-6px',
                  right:          '-6px',
                  background:     '#DC2626',
                  color:          '#FFFFFF',
                  borderRadius:   '50%',
                  width:          '18px',
                  height:         '18px',
                  fontSize:       '11px',
                  fontWeight:     '700',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  border:         '2px solid #FFFFFF',
                }}>
                  {itemCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#6B7280', display: 'none' }}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div style={{ borderTop: '1px solid #F0EAE0', padding: '16px 24px', background: '#FFFFFF' }}>
            <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search qalam, ink, art paper..."
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    border: '1.5px solid #C9A84C', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px' }}>
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid #F0EAE0', background: '#FFFFFF', padding: '16px 24px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: '15px', fontWeight: '500', color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F9FAFB' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}