import { Truck } from 'lucide-react'
import CourierSelector from '../shop/CourierSelector'
import type { CourierKey } from '../../utils/shipping'

interface DeliveryFormProps {
    register: any
    errors: any
    selectedCourier: CourierKey
    weightKg: number
    isFreeShip: boolean
    onCourierSelect: (courier: CourierKey) => void
}

export function DeliveryForm({
    register,
    errors,
    selectedCourier,
    weightKg,
    isFreeShip,
    onCourierSelect,
}: DeliveryFormProps) {
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
                <Truck size={18} style={{ color: '#C9A84C' }} />
                <h3
                    style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                    }}
                >
                    Delivery Information
                </h3>
            </div>

            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        {...register('fullName')}
                        className={`input ${errors.fullName ? 'input-error' : ''}`}
                        placeholder="Ahmad Hassan"
                    />
                    {errors.fullName && (
                        <p className="error-text">{errors.fullName.message}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        {...register('phone')}
                        className={`input ${errors.phone ? 'input-error' : ''}`}
                        placeholder="+92 300 1234567"
                    />
                    {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="form-group">
                <label>Email Address *</label>
                <input
                    {...register('email')}
                    type="email"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="ahmad@email.com"
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div className="form-group">
                <label>Street Address *</label>
                <input
                    {...register('street')}
                    className={`input ${errors.street ? 'input-error' : ''}`}
                    placeholder="House #123, Street 4, Block A"
                />
                {errors.street && <p className="error-text">{errors.street.message}</p>}
            </div>

            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label>City *</label>
                    <input
                        {...register('city')}
                        className={`input ${errors.city ? 'input-error' : ''}`}
                        placeholder="Jhang"
                    />
                    {errors.city && <p className="error-text">{errors.city.message}</p>}
                </div>
                <div className="form-group">
                    <label>Province *</label>
                    <select
                        {...register('province')}
                        className={`input ${errors.province ? 'input-error' : ''}`}
                    >
                        <option value="">Select Province</option>
                        {[
                            'Punjab',
                            'Sindh',
                            'KPK',
                            'Balochistan',
                            'Islamabad',
                            'AJK',
                            'Gilgit-Baltistan',
                        ].map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    {errors.province && (
                        <p className="error-text">{errors.province.message}</p>
                    )}
                </div>
            </div>

            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label>Postal Code</label>
                    <input {...register('postalCode')} className="input" placeholder="35200" />
                </div>
                <div className="form-group">
                    <label>Country</label>
                    <input {...register('country')} className="input" />
                </div>
            </div>

            {/* Courier selector */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                <CourierSelector
                    selected={selectedCourier}
                    weightKg={weightKg}
                    freeShipping={isFreeShip}
                    onSelect={onCourierSelect}
                />
            </div>

            <div
                className="form-group"
                style={{
                    marginBottom: 0,
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #F3F4F6',
                }}
            >
                <label>Order Note (Optional)</label>
                <textarea
                    {...register('note')}
                    className="input"
                    rows={2}
                    placeholder="Special instructions for your order..."
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    )
}