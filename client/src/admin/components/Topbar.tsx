import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from 'lucide-react'

interface TopbarProps {
  collapsed:        boolean
  onToggleCollapse: () => void
  onToggleMobile:   () => void
  user:             any
  onLogout:         () => void
}

export default function Topbar({
  collapsed,
  onToggleCollapse,
  onToggleMobile,
  user,
  onLogout,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef                     = useRef<HTMLDivElement>(null)
  const navigate                        = useNavigate()

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="admin-topbar">

      {/* Left — toggle buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Desktop collapse */}
        <button
          onClick={onToggleCollapse}
          style={{
            background:    'none',
            border:        'none',
            cursor:        'pointer',
            padding:       '8px',
            borderRadius:  '8px',
            color:         '#6B7280',
            display:       'flex',
            alignItems:    'center',
            transition:    'all 0.2s',
          }}
          className="desktop-toggle"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F3F4F6'
            e.currentTarget.style.color      = '#1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color      = '#6B7280'
          }}
        >
          {collapsed
            ? <PanelLeftOpen size={20} />
            : <PanelLeftClose size={20} />
          }
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobile}
          style={{
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            padding:      '8px',
            borderRadius: '8px',
            color:        '#6B7280',
            display:      'none',
            alignItems:   'center',
          }}
          className="mobile-toggle"
        >
          <Menu size={20} />
        </button>

        {/* Page breadcrumb area */}
        <div style={{
          height:     '20px',
          width:      '1px',
          background: '#E5E7EB',
          margin:     '0 4px',
        }} />

        <p style={{
          fontSize:   '13px',
          color:      '#9CA3AF',
          fontWeight: '500',
        }}>
          Welcome back,{' '}
          <span style={{ color: '#C9A84C', fontWeight: '600' }}>
            {user?.name ?? 'Admin'}
          </span>
        </p>
      </div>

      {/* Right — actions */}
      <div style={{
        marginLeft:  'auto',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
      }}>

        {/* Notification bell */}
        <button
          style={{
            background:    'none',
            border:        'none',
            cursor:        'pointer',
            padding:       '8px',
            borderRadius:  '8px',
            color:         '#6B7280',
            display:       'flex',
            alignItems:    'center',
            position:      'relative',
            transition:    'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F3F4F6'
            e.currentTarget.style.color      = '#1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color      = '#6B7280'
          }}
        >
          <Bell size={19} />
          {/* notification dot */}
          <span style={{
            position:      'absolute',
            top:           '6px',
            right:         '6px',
            width:         '8px',
            height:        '8px',
            background:    '#DC2626',
            borderRadius:  '50%',
            border:        '2px solid #FFFFFF',
          }} />
        </button>

        {/* Divider */}
        <div style={{
          height:     '28px',
          width:      '1px',
          background: '#E5E7EB',
        }} />

        {/* User dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           '10px',
              background:    'none',
              border:        '1px solid #E5E7EB',
              borderRadius:  '10px',
              padding:       '6px 12px 6px 6px',
              cursor:        'pointer',
              transition:    'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background   = '#F9FAFB'
              e.currentTarget.style.borderColor  = '#C9A84C'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background   = 'none'
              e.currentTarget.style.borderColor  = '#E5E7EB'
            }}
          >
            {/* Avatar */}
            <div style={{
              width:          '32px',
              height:         '32px',
              background:     'linear-gradient(135deg, #C9A84C, #A8893A)',
              borderRadius:   '8px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}>
              <span style={{
                fontSize:   '13px',
                fontWeight: '700',
                color:      '#1A1A1A',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </span>
            </div>

            {/* Name & role */}
            <div style={{ textAlign: 'left' }}>
              <p style={{
                fontSize:   '13px',
                fontWeight: '600',
                color:      '#1A1A1A',
                lineHeight: '1.2',
              }}>
                {user?.name ?? 'Admin'}
              </p>
              <p style={{
                fontSize:   '11px',
                color:      '#C9A84C',
                fontWeight: '500',
              }}>
                {user?.role ?? 'ADMIN'}
              </p>
            </div>

            <ChevronDown
              size={14}
              style={{
                color:      '#9CA3AF',
                transform:  dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position:     'absolute',
              top:          'calc(100% + 8px)',
              right:        0,
              background:   '#FFFFFF',
              border:       '1px solid #E5E7EB',
              borderRadius: '12px',
              padding:      '8px',
              minWidth:     '200px',
              boxShadow:    '0 8px 24px rgba(0,0,0,0.12)',
              zIndex:       100,
            }}>

              {/* User info */}
              <div style={{
                padding:      '8px 12px 12px',
                borderBottom: '1px solid #F3F4F6',
                marginBottom: '8px',
              }}>
                <p style={{
                  fontSize:   '13px',
                  fontWeight: '600',
                  color:      '#1A1A1A',
                }}>
                  {user?.name}
                </p>
                <p style={{
                  fontSize:  '12px',
                  color:     '#6B7280',
                  marginTop: '2px',
                }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              {[
                {
                  icon:    User,
                  label:   'My Profile',
                  action:  () => { navigate('/admin/settings'); setDropdownOpen(false) },
                  color:   '#374151',
                },
                {
                  icon:    Settings,
                  label:   'Settings',
                  action:  () => { navigate('/admin/settings'); setDropdownOpen(false) },
                  color:   '#374151',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width:         '100%',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '10px',
                    padding:       '9px 12px',
                    background:    'none',
                    border:        'none',
                    borderRadius:  '8px',
                    cursor:        'pointer',
                    fontSize:      '14px',
                    color:         item.color,
                    fontWeight:    '500',
                    transition:    'background 0.15s',
                    fontFamily:    'Inter, sans-serif',
                    textAlign:     'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}

              {/* Divider */}
              <div style={{
                height:  '1px',
                background: '#F3F4F6',
                margin:  '8px 0',
              }} />

              {/* Logout */}
              <button
                onClick={() => { onLogout(); setDropdownOpen(false) }}
                style={{
                  width:         '100%',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '10px',
                  padding:       '9px 12px',
                  background:    'none',
                  border:        'none',
                  borderRadius:  '8px',
                  cursor:        'pointer',
                  fontSize:      '14px',
                  color:         '#DC2626',
                  fontWeight:    '500',
                  transition:    'background 0.15s',
                  fontFamily:    'Inter, sans-serif',
                  textAlign:     'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={15} />
                Sign Out
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  )
}