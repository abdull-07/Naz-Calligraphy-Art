import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../services/auth.service'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function AdminLogin() {
  const navigate = useNavigate()
  const { setAuth, isAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  // redirect if already logged in

  useEffect(() => {
    if (isAuth) {
      navigate('/admin', { replace: true })
    }
  }, [isAuth, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    try {
      const data = await authService.login(values.email, values.password)

      // check role
      if (!['ADMIN', 'MANAGER', 'SUPPORT'].includes(data.user.role)) {
        toast.error('You do not have admin access')
        return
      }

      setAuth(data.user, data.accessToken)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/admin', { replace: true })

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Login failed'
      toast.error(msg)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 50%, #1A1A1A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Background pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(45,125,154,0.08) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* Gold emblem */}
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #C9A84C, #A8893A)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
          }}>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '28px',
              fontWeight: '700',
              color: '#1A1A1A',
            }}>N</span>
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '26px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '6px',
          }}>
            Naz Calligraphy Art
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
            Admin Panel — Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '20px',
          padding: '36px',
          backdropFilter: 'blur(10px)',
        }}>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#D1D5DB',
                marginBottom: '8px',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                  }}
                />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@nazcalligraphy.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${errors.email ? '#DC2626' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#C9A84C'
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#DC2626' : 'rgba(255,255,255,0.12)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#D1D5DB',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                  }}
                />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${errors.password ? '#DC2626' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#C9A84C'
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#DC2626' : 'rgba(255,255,255,0.12)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '0',
                    display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px',
                background: isSubmitting
                  ? 'rgba(201,168,76,0.5)'
                  : 'linear-gradient(135deg, #C9A84C, #A8893A)',
                border: 'none',
                borderRadius: '10px',
                color: '#1A1A1A',
                fontSize: '15px',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
                boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(201,168,76,0.35)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: '#4B5563',
        }}>
          © 2026 Naz Calligraphy Art. All rights reserved.
        </p>
      </div>
    </div>
  )
}