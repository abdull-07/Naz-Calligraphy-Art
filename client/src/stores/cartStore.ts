import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId:         number
  productId:         number
  productName:       string
  variantLabel:      string
  price:             number
  comparePrice:      number | null
  quantity:          number
  image:             string | null
  slug:              string
  localShippingOnly: boolean
  freeShipping:      boolean   // ← new
  weightKg:          number    // ← new
}

export type CourierKey = 'TCS' | 'PAKISTAN_POST' | 'LEOPARDS'

interface CartState {
  items:           CartItem[]
  couponCode:      string | null
  couponDiscount:  number
  freeShipping:    boolean
  selectedCourier: CourierKey
  sessionId:       string

  addItem:         (item: CartItem) => void
  updateQty:       (variantId: number, qty: number) => void
  removeItem:      (variantId: number) => void
  clearCart:       () => void
  applyCoupon:     (code: string, discount: number, freeShipping?: boolean) => void
  removeCoupon:    () => void
  setCourier:      (courier: CourierKey) => void

  // computed
  itemCount:       () => number
  subtotal:        () => number
  totalWeightKg:   () => number
  allFreeShipping: () => boolean
}

const generateSessionId = () =>
  `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:           [],
      couponCode:      null,
      couponDiscount:  0,
      freeShipping:    false,
      selectedCourier: 'TCS',
      sessionId:       generateSessionId(),

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
        if (qty <= 0) { get().removeItem(variantId); return }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      clearCart: () => set({
        items: [], couponCode: null, couponDiscount: 0,
        freeShipping: false, selectedCourier: 'TCS',
      }),

      applyCoupon: (code, discount, freeShipping = false) =>
        set({ couponCode: code, couponDiscount: discount, freeShipping }),

      removeCoupon: () =>
        set({ couponCode: null, couponDiscount: 0, freeShipping: false }),

      setCourier: (courier) => set({ selectedCourier: courier }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalWeightKg: () =>
        get().items.reduce((sum, i) => sum + (i.weightKg ?? 0.5) * i.quantity, 0),

      allFreeShipping: () =>
        get().items.length > 0 && get().items.every((i) => i.freeShipping),
    }),
    {
      name: 'naz-cart',
      partialize: (state) => ({
        items:           state.items,
        couponCode:      state.couponCode,
        couponDiscount:  state.couponDiscount,
        freeShipping:    state.freeShipping,
        selectedCourier: state.selectedCourier,
        sessionId:       state.sessionId,
      }),
    },
  ),
)