// import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export function GuestNotice() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#F8F4EF',
                borderRadius: '10px',
                border: '1px solid #F0EAE0',
                marginTop: '12px',
                marginBottom: '20px',
            }}
        >
            <User size={16} style={{ color: '#C9A84C', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                Checking out as guest.{' '}
                Sign in
                {/* <Link
                    to="/login"
                    style={{ color: '#C9A84C', fontWeight: '600', textDecoration: 'none' }}
                >
                    Sign in
                </Link>{' '} */}
                to track your orders, \save addresses, and get order updates. If you experience any issues, please contact our support team
            </p>
        </div>
    )
}