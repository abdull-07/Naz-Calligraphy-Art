export type CourierKey = 'TCS' | 'PAKISTAN_POST' | 'LEOPARDS'

export interface CourierRate {
    key: CourierKey
    name: string
    logo: string
    description: string
    calculate: (weightKg: number) => number
    estimatedDays: string
}

// ─── RATE TABLES ─────────────────────────────────────────────────────────────

// TCS — flat Rs. 200 per KG (minimum 1 KG)
const calcTCS = (weightKg: number): number => {
    const effectiveWeight = Math.max(1, Math.ceil(weightKg * 10) / 10)
    return Math.ceil(effectiveWeight) * 200
}

// Pakistan Post rates
const calcPakistanPost = (weightKg: number): number => {
    if (weightKg <= 1) return 200
    if (weightKg <= 3) return 270
    if (weightKg <= 5) return 380
    if (weightKg <= 10) return 570
    // above 10 KG — 570 + 50 per extra KG
    return 570 + Math.ceil(weightKg - 10) * 50
}

// Leopards — similar to TCS, Rs. 180 per KG (minimum 0.5 KG)
const calcLeopards = (weightKg: number): number => {
    if (weightKg <= 0.5) return 180
    if (weightKg <= 1) return 220
    if (weightKg <= 2) return 300
    if (weightKg <= 5) return 450
    if (weightKg <= 10) return 650
    return 650 + Math.ceil(weightKg - 10) * 60
}

// ─── COURIER DEFINITIONS ─────────────────────────────────────────────────────

export const COURIERS: CourierRate[] = [
    {
        key: 'TCS',
        name: 'TCS Courier',
        logo: '🚚',
        description: 'Rs. 200 per KG — Fast & reliable',
        calculate: calcTCS,
        estimatedDays: '1–3 business days',
    },
    {
        key: 'PAKISTAN_POST',
        name: 'Pakistan Post',
        logo: '📮',
        description: '0–1kg: Rs.200 | 1–3kg: Rs.270 | 3–5kg: Rs.380 | 5–10kg: Rs.570',
        calculate: calcPakistanPost,
        estimatedDays: '3–7 business days',
    },
    {
        key: 'LEOPARDS',
        name: 'Leopards Courier',
        logo: '🐆',
        description: 'Weight-based rates — Express delivery',
        calculate: calcLeopards,
        estimatedDays: '1–2 business days',
    },
]

export function calculateShipping(
    courier: CourierKey,
    weightKg: number,
    freeShipping: boolean,
): number {
    if (freeShipping || weightKg === 0) return 0
    const courierDef = COURIERS.find((c) => c.key === courier)
    return courierDef ? courierDef.calculate(weightKg) : 0
}

export function getCourierByKey(key: CourierKey): CourierRate | undefined {
    return COURIERS.find((c) => c.key === key)
}