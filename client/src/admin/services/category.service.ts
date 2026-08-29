import api from '../../lib/axios'

export const categoryService = {
    getAll: async () => {
        const { data } = await api.get('/categories/admin/all')
        return data
    },

    create: async (payload: any) => {
        const { data } = await api.post('/categories', payload)
        return data
    },

    update: async (id: number, payload: any) => {
        const { data } = await api.patch(`/categories/${id}`, payload)
        return data
    },

    remove: async (id: number) => {
        const { data } = await api.delete(`/categories/${id}`)
        return data
    },
}