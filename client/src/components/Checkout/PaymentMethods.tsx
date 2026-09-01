
import { ShieldCheck } from 'lucide-react'
import { BankTransferDetails } from './BankTransferDetails'

const paymentOptions = [
    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
    { value: 'JAZZCASH', label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet', icon: '📱' },
    { value: 'EASYPAISA', label: 'EasyPaisa', desc: 'Pay via EasyPaisa mobile wallet', icon: '📲' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'Transfer directly to our account', icon: '🏦' },
]

interface PaymentMethodsProps {
    register: any
    selectedPayment: string
}

export function PaymentMethods({ register, selectedPayment }: PaymentMethodsProps) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F0EAE0',
                padding: '24px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                }}
            >
                <ShieldCheck size={18} style={{ color: '#C9A84C' }} />
                <h3
                    style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                    }}
                >
                    Payment Method
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentOptions.map((opt) => (
                    <label
                        key={opt.value}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            border: `2px solid ${selectedPayment === opt.value ? '#C9A84C' : '#E5E7EB'
                                }`,
                            background: selectedPayment === opt.value ? '#FFFBEB' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            margin: 0,
                        }}
                    >
                        <input
                            type="radio"
                            value={opt.value}
                            {...register('payment')}
                            style={{ accentColor: '#C9A84C', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                        <div>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                    margin: 0,
                                }}
                            >
                                {opt.label}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                                {opt.desc}
                            </p>
                        </div>
                    </label>
                ))}
            </div>

            {selectedPayment === 'BANK_TRANSFER' && <BankTransferDetails />}
        </div>
    )
}