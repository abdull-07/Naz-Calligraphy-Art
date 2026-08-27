import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'

export default function AdminLayout() {
  const [collapsed, setCollapsed]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, clearAuth }         = useAuthStore()
  const navigate                    = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore error — logout anyway
    } finally {
      clearAuth()
      toast.success('Logged out successfully')
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="admin-layout">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(0,0,0,0.5)',
            zIndex:     49,
            display:    'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>

        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onToggleMobile={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}