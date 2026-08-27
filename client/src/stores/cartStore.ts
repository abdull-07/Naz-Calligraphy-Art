import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId:    number
  productId:    number
  productName:  string
  variantLabel: string
  price:        number
  comparePrice: number | null
  quantity:     number
  image:        string | null
  slug:         string
  localShippingOnly: boolean
}

interface CartState {
  items:          CartItem[]
  couponCode:     string | null
  couponDiscount: number
  sessionId:      string

  addItem:        (item: CartItem) => void
  updateQty:      (variantId: number, qty: number) => void
  removeItem:     (variantId: number) => void
  clearCart:      () => void
  applyCoupon:    (code: string, discount: number) => void
  removeCoupon:   () => void

  // computed
  itemCount:   () => number
  subtotal:    () => number
  total:       () => number
}

// generate a guest session ID
const generateSessionId = () =>
  `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:          [],
      couponCode:     null,
      couponDiscount: 0,
      sessionId:      generateSessionId(),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () =>
        set({ couponCode: null, couponDiscount: 0 }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const { subtotal, couponDiscount } = get()
        return Math.max(0, subtotal() - couponDiscount)
      },
    }),
    {
      name: 'naz-cart',
      partialize: (state) => ({
        items:          state.items,
        couponCode:     state.couponCode,
        couponDiscount: state.couponDiscount,
        sessionId:      state.sessionId,
      }),
    },
  ),
)