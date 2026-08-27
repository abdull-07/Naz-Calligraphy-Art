import { Link } from 'react-router-dom'
import { Camera, MessageCircle, Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background:   '#1A1A1A',
      color:        '#9CA3AF',
      padding:      '60px 24px 24px',
      marginTop:    'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                 '40px',
          marginBottom:        '48px',
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #C9A84C, #A8893A)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>N</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>Naz Calligraphy Art</p>
                <p style={{ fontSize: '11px', color: '#C9A84C' }}>Premium Supplies</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#6B7280' }}>
              Pakistan's finest Arabic calligraphy supplies. Handcrafted qalam, authentic inks, and premium art materials.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              
              {[
                 { icon: Camera, href: '#', label: 'Instagram' },
                 { icon: Users, href: '#', label: 'Facebook' },
                { icon: MessageCircle, href: 'https://wa.me/923001234567', label: 'WhatsApp' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '36px', height: '36px', background: '#2A2A2A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#1A1A1A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.color = '#6B7280' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Shop</h4>
            {['Qalam', 'Inkpot', 'Colors', 'Art Paper', 'Bundles', 'Practice Books'].map((item) => (
              <Link
                key={item}
                to={`/shop?category=${item.toLowerCase().replace(' ', '-')}`}
                style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Info</h4>
            {[
              { label: 'About Us',        path: '/about' },
              { label: 'Blog',            path: '/blog' },
              { label: 'Contact Us',      path: '/contact' },
              { label: 'FAQ',             path: '/faq' },
              { label: 'Shipping Policy', path: '/shipping-policy' },
              { label: 'Returns Policy',  path: '/returns-policy' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Contact</h4>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>Jhang City, Punjab, Pakistan</p>
            <a href="tel:+923001234567" style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '10px' }}>+92 300 123 4567</a>
            <a href="mailto:info@nazcalligraphy.com" style={{ display: 'block', fontSize: '13px', color: '#6B7280', textDecoration: 'none', marginBottom: '16px' }}>info@nazcalligraphy.com</a>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#FFFFFF', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#4B5563' }}>
            © 2026 Naz Calligraphy Art. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy', 'Terms & Conditions'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/ /g, '-')}`}
                style={{ fontSize: '12px', color: '#4B5563', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#4B5563'}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}