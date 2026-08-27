import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Clock,
  Truck,
  Settings,
} from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import KpiCard from '../components/KpiCard'
import SalesChart from '../components/SalesChart'
import RecentOrders from '../components/RecentOrders'
import AlertsPanel from '../components/AlertsPanel'
import TopProducts from '../components/TopProducts'

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
    refetchInterval: 1000 * 60 * 5, // refresh every 5 min
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardService.getTopProducts(6),
  })

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-error" style={{ maxWidth: '500px' }}>
        <p>Failed to load dashboard. Please refresh the page.</p>
      </div>
    )
  }

  const { kpis, orderStatus, alerts, recentOrders } = data

  return (
    <div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome to Naz Calligraphy Art admin panel
          </p>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>

        <KpiCard
          title="Today's Revenue"
          value={kpis.today.revenue}
          prefix="Rs."
          icon={<DollarSign size={22} style={{ color: '#92400E' }} />}
          iconBg="#FEF3C7"
          subtitle="Paid orders today"
        />

        <KpiCard
          title="Today's Orders"
          value={kpis.today.orders}
          icon={<ShoppingCart size={22} style={{ color: '#166534' }} />}
          iconBg="#DCFCE7"
          subtitle="Orders placed today"
        />

        <KpiCard
          title="Monthly Revenue"
          value={kpis.thisMonth.revenue}
          prefix="Rs."
          icon={<DollarSign size={22} style={{ color: '#1E40AF' }} />}
          iconBg="#DBEAFE"
          growth={kpis.thisMonth.revenueGrowth}
        />

        <KpiCard
          title="Total Customers"
          value={kpis.totals.customers}
          icon={<Users size={22} style={{ color: '#0F766E' }} />}
          iconBg="#CCFBF1"
          subtitle={`${kpis.totals.orders} total orders`}
        />

        <KpiCard
          title="Active Products"
          value={kpis.totals.products}
          icon={<Package size={22} style={{ color: '#5B21B6' }} />}
          iconBg="#EDE9FE"
          subtitle="In store"
        />
      </div>

      {/* ── ORDER STATUS STRIP ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {[
          {
            label: 'Pending',
            count: orderStatus.pending,
            icon: Clock,
            color: '#D97706',
            bg: '#FFFBEB',
          },
          {
            label: 'Processing',
            count: orderStatus.processing,
            icon: Settings,
            color: '#2563EB',
            bg: '#EFF6FF',
          },
          {
            label: 'Shipped',
            count: orderStatus.shipped,
            icon: Truck,
            color: '#0F766E',
            bg: '#CCFBF1',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="card-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: `3px solid ${item.color}`,
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: item.bg,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div>
              <p style={{
                fontSize: '22px',
                fontWeight: '700',
                color: item.color,
                lineHeight: '1',
              }}>
                {item.count}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '2px',
              }}>
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'start',
      }}>
        <SalesChart />
        <AlertsPanel alerts={alerts} />
        <TopProducts products={topProducts} />
      </div>

      {/* ── BOTTOM ROW ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        alignItems: 'start',
      }}>
        <RecentOrders orders={recentOrders} />
      </div>

    </div>
  )
}