import api from '../../lib/axios'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  me: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}