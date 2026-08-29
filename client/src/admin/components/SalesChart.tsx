import { useState } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { format, parseISO } from 'date-fns'

type Period = '7d' | '30d' | '90d'

const periods: { label: string; value: Period }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
]

export default function SalesChart() {
    const [period, setPeriod] = useState<Period>('30d')

    const { data = [], isLoading } = useQuery({
        queryKey: ['sales-chart', period],
        queryFn: () => dashboardService.getSalesChart(period),
    })

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null
        return (
            <div style={{
                background: '#1A1A1A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
                    {label}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: '#C9A84C',
                        }} />
                        <span style={{ fontSize: '13px', color: '#D1D5DB' }}>Revenue</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                            Rs. {Number(payload[0]?.value ?? 0).toLocaleString()}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: '#2D7D9A',
                        }} />
                        <span style={{ fontSize: '13px', color: '#D1D5DB' }}>Orders</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                            {payload[1]?.value ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const formattedData = data.map((item: any) => ({
        ...item,
        date: format(parseISO(item.date), period === '90d' ? 'MMM d' : 'MMM d'),
    }))

    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div>
                    <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                    }}>
                        Sales Overview
                    </h3>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                        Revenue and order trends
                    </p>
                </div>

                {/* Period selector */}
                <div style={{
                    display: 'flex',
                    background: '#F3F4F6',
                    borderRadius: '8px',
                    padding: '4px',
                    gap: '2px',
                }}>
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontFamily: 'Inter, sans-serif',
                                background: period === p.value ? '#FFFFFF' : 'transparent',
                                color: period === p.value ? '#C9A84C' : '#6B7280',
                                boxShadow: period === p.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            {isLoading ? (
                <div style={{
                    height: '280px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div className="spinner" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2D7D9A" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#2D7D9A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                            interval={period === '7d' ? 0 : period === '30d' ? 4 : 8}
                        />
                        <YAxis
                            yAxisId="revenue"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#C9A84C"
                            strokeWidth={2.5}
                            fill="url(#goldGradient)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#C9A84C', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                        <Area
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke="#2D7D9A"
                            strokeWidth={2}
                            fill="url(#tealGradient)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#2D7D9A', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}