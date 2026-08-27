import api from '../lib/axios'

export const shopService = {
    getProducts: async (params?: {
        category?: string
        search?: string
        sort?: string
        page?: number
        limit?: number
        inStock?: string
        featured?: string
    }) => {
        const { data } = await api.get('/products', { params })
        return data
    },

    getProduct: async (slug: string) => {
        const { data } = await api.get(`/products/${slug}`)
        return data
    },

    getCategories: async () => {
        const { data } = await api.get('/categories')
        return data
    },

    getBanners: async () => {
        const { data } = await api.get('/admin/banners')
        return data
    },

    getShippingRate: async (country = 'PK') => {
        const { data } = await api.post('/shipping/calculate', { country })
        return data
    },

    validateCoupon: async (code: string, subtotal: number) => {
        const { data } = await api.post('/admin/coupons/validate', { code, subtotal })
        return data
    },

    placeOrder: async (payload: {
        items: { variantId: number; quantity: number }[]
        addressId?: number
        shippingType: string
        paymentProvider: string
        couponCode?: string
        customerNote?: string
        guestInfo?: { name: string; email: string; phone: string; address: any }
    }) => {
        const { data } = await api.post('/orders', payload)
        return data
    },

    getOrderConfirmation: async (id: number) => {
        const { data } = await api.get(`/orders/my/${id}`)
        return data
    },
}