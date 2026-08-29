import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function AdminGuard() {
  const { isAuth, user } = useAuthStore()

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER' && user?.role !== 'SUPPORT') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}