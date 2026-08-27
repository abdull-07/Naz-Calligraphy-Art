import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id:              number
  name:            string
  email:           string
  role:            string
  avatarUrl?:      string
  isEmailVerified: boolean
}

interface AuthState {
  user:        User | null
  accessToken: string | null
  isAuth:      boolean
  setAuth:     (user: User, token: string) => void
  clearAuth:   () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isAuth:      false,

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken, isAuth: true })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuth: false })
      },
    }),
    {
      name:    'naz-auth',
      partialize: (state) => ({
        user:        state.user,
        accessToken: state.accessToken,
        isAuth:      state.isAuth,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem('accessToken', state.accessToken)
        }
      },
    },
  ),
)