// client/src/components/OrderConfirm/LoadingState.tsx
export function LoadingState() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '16px'
        }}>
            <div className="spinner" style={{ width: '40px', height: '40px' }} />
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading your order...</p>
        </div>
    )
}