import api from '../../lib/axios'

export const dashboardService = {
    getDashboard: async () => {
        const { data } = await api.get('/admin/dashboard')
        return data
    },

    getSalesChart: async (period: '7d' | '30d' | '90d' = '30d') => {
        const { data } = await api.get(`/admin/dashboard/chart?period=${period}`)
        return data
    },

    getTopProducts: async (limit = 10) => {
        const { data } = await api.get(`/admin/dashboard/top-products?limit=${limit}`)
        return data
    },
}