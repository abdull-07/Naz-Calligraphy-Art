import api from '../../lib/axios'

export const productService = {
    getAll: async (params?: {
        search?: string
        category?: string
        status?: string
        sort?: string
        page?: number
        limit?: number
    }) => {
        const { data } = await api.get('/products/admin/all', { params })
        return data
    },

    getBySlug: async (slug: string) => {
        const { data } = await api.get(`/products/${slug}`)
        return data
    },

    getById: async (id: number) => {
        const { data } = await api.get(`/products/admin/all`, {
            params: { id }
        })
        return data
    },

    create: async (payload: any) => {
        const { data } = await api.post('/products', payload)
        return data
    },

    update: async (id: number, payload: any) => {
        const { data } = await api.patch(`/products/${id}`, payload)
        return data
    },

    remove: async (id: number) => {
        const { data } = await api.delete(`/products/${id}`)
        return data
    },

    // Variants
    createVariant: async (productId: number, payload: any) => {
        const { data } = await api.post(`/products/${productId}/variants`, payload)
        return data
    },

    updateVariant: async (productId: number, variantId: number, payload: any) => {
        const { data } = await api.patch(`/products/${productId}/variants/${variantId}`, payload)
        return data
    },

    deleteVariant: async (productId: number, variantId: number) => {
        const { data } = await api.delete(`/products/${productId}/variants/${variantId}`)
        return data
    },

    // Images
    uploadImage: async (productId: number, file: File, isPrimary = false) => {
        const form = new FormData()
        form.append('file', file)
        form.append('isPrimary', String(isPrimary))
        const { data } = await api.post(`/products/${productId}/images`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteImage: async (productId: number, imageId: number) => {
        const { data } = await api.delete(`/products/${productId}/images/${imageId}`)
        return data
    },

    reorderImages: async (productId: number, imageIds: number[]) => {
        const { data } = await api.patch(`/products/${productId}/images/reorder`, { imageIds })
        return data
    },
}