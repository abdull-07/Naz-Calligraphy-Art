import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Star,
  BookOpen,
  Image,
  HelpCircle,
  Ticket,
  BarChart3,
  Settings,
  ChevronRight,
  X,
  Truck,
  Mail,
  MessageSquare,
} from 'lucide-react'

interface SidebarProps {
  collapsed:    boolean
  sidebarOpen:  boolean
  onClose:      () => void
}

const navItems = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',  icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    label: 'Store',
    items: [
      { label: 'Orders',     icon: ShoppingCart, path: '/admin/orders' },
      { label: 'Products',   icon: Package,      path: '/admin/products' },
      { label: 'Categories', icon: Tag,          path: '/admin/categories' },
      { label: 'Customers',  icon: Users,        path: '/admin/customers' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Reviews',    icon: Star,         path: '/admin/reviews' },
      { label: 'Blog',       icon: BookOpen,     path: '/admin/blog' },
      { label: 'Banners',    icon: Image,        path: '/admin/banners' },
      { label: 'FAQs',       icon: HelpCircle,   path: '/admin/faqs' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Coupons',    icon: Ticket,       path: '/admin/coupons' },
      { label: 'Newsletter', icon: Mail,         path: '/admin/newsletter' },
    ],
  },
  {
    label: 'Other',
    items: [
      { label: 'Reports',    icon: BarChart3,    path: '/admin/reports' },
      { label: 'Shipping',   icon: Truck,        path: '/admin/shipping' },
      // { label: 'Contact',    icon: MessageSquare, path: '/admin/contact' },
      { label: 'Settings',   icon: Settings,     path: '/admin/settings' },
    ],
  },
]

export default function Sidebar({ collapsed, sidebarOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}
      style={{
        transform: sidebarOpen ? 'translateX(0)' : '',
      }}
    >
      {/* Logo */}
      <div style={{
        padding:        '24px 16px 20px',
        borderBottom:   '1px solid rgba(255,255,255,0.08)',
        display:        'flex',
        alignItems:     'center',
        gap:            '12px',
        flexShrink:     0,
      }}>
        {/* Gold emblem */}
        <div style={{
          width:          '40px',
          height:         '40px',
          background:     'linear-gradient(135deg, #C9A84C, #A8893A)',
          borderRadius:   '10px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          boxShadow:      '0 4px 12px rgba(201,168,76,0.3)',
        }}>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize:   '18px',
            fontWeight: '700',
            color:      '#1A1A1A',
          }}>N</span>
        </div>

        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontFamily:   'Playfair Display, serif',
              fontSize:     '14px',
              fontWeight:   '700',
              color:        '#FFFFFF',
              whiteSpace:   'nowrap',
              lineHeight:   '1.2',
            }}>
              Naz Calligraphy
            </p>
            <p style={{
              fontSize:  '11px',
              color:     '#C9A84C',
              marginTop: '2px',
            }}>
              Admin Panel
            </p>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onClose}
          style={{
            marginLeft:  'auto',
            background:  'none',
            border:      'none',
            color:       '#6B7280',
            cursor:      'pointer',
            padding:     '4px',
            display:     'none',
            alignItems:  'center',
          }}
          className="mobile-close-btn"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{
        flex:       1,
        minHeight:  0,
        overflowY:  'auto',
        padding:    '12px 0',
      }}>
        {navItems.map((group) => (
          <div key={group.label} style={{ marginBottom: '8px' }}>

            {/* Group label */}
            {!collapsed && (
              <p style={{
                fontSize:      '10px',
                fontWeight:    '700',
                color:         '#4B5563',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding:       '8px 24px 4px',
              }}>
                {group.label}
              </p>
            )}

            {/* Items */}
            {group.items.map((item) => {
              const Icon   = item.icon
              const active = isActive(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="nav-item"
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background:     active
                      ? 'linear-gradient(135deg, #C9A84C, #A8893A)'
                      : 'transparent',
                    color:          active ? '#1A1A1A' : '#9CA3AF',
                    position:       'relative',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    style={{ flexShrink: 0 }}
                  />

                  {!collapsed && (
                    <span style={{ flex: 1, fontSize: '14px' }}>
                      {item.label}
                    </span>
                  )}

                  {!collapsed && active && (
                    <ChevronRight size={14} />
                  )}

                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div style={{
                      position:      'absolute',
                      left:          '100%',
                      top:           '50%',
                      transform:     'translateY(-50%)',
                      background:    '#1A1A1A',
                      color:         '#FFFFFF',
                      padding:       '6px 10px',
                      borderRadius:  '6px',
                      fontSize:      '13px',
                      fontWeight:    '500',
                      whiteSpace:    'nowrap',
                      marginLeft:    '8px',
                      pointerEvents: 'none',
                      opacity:       0,
                      transition:    'opacity 0.2s',
                      border:        '1px solid rgba(255,255,255,0.1)',
                    }}
                    className="nav-tooltip"
                    >
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom — version */}
      {!collapsed && (
        <div style={{
          padding:     '16px',
          borderTop:   '1px solid rgba(255,255,255,0.08)',
          flexShrink:  0,
        }}>
          <p style={{
            fontSize:  '11px',
            color:     '#4B5563',
            textAlign: 'center',
          }}>
            Naz Calligraphy Art v1.0
          </p>
        </div>
      )}
    </aside>
  )
}