import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import AdminGuard from './admin/guards/AdminGuard'
import AdminLayout from './admin/layouts/AdminLayout'
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
import Orders from './admin/pages/Orders'
import Products from './admin/pages/Products'
import ProductForm from './admin/pages/ProductForm'
import Categories from './admin/pages/Categories'
import Customers from './admin/pages/Customers'
import Reviews from './admin/pages/Reviews'
import Blog from './admin/pages/Blog'
import Banners from './admin/pages/Banners'
import Faqs from './admin/pages/Faqs'
import Coupons from './admin/pages/Coupons'
import Reports from './admin/pages/Reports'
import Settings from './admin/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>

            {/* Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="categories" element={<Categories />} />
                <Route path="customers" element={<Customers />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="blog" element={<Blog />} />
                <Route path="banners" element={<Banners />} />
                <Route path="faqs" element={<Faqs />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#1A1A1A' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
          }}
        />
      </QueryClientProvider>
    </HelmetProvider>
  )
}