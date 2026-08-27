import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL,
  withCredentials: true,
})

// attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// auto refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        const newToken = data.accessToken
        localStorage.setItem('accessToken', newToken)

        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, newToken)
        }

        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/admin/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api