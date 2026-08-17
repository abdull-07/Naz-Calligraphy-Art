import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponType } from '../../generated/prisma';

export interface CreateCouponDto {
    code: string;
    description?: string;
    type: CouponType;
    value: number;
    minOrderAmt?: number;
    maxDiscount?: number;
    usesLimit?: number;
    startsAt?: Date;
    expiresAt?: Date;
}

@Injectable()
export class CouponService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);
        return coupon;
    }

    async validate(code: string, subtotal: number) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon || !coupon.isActive) {
            throw new NotFoundException('Invalid or expired coupon code');
        }

        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now) {
            throw new ConflictException('Coupon is not yet active');
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
            throw new ConflictException('Coupon has expired');
        }
        if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) {
            throw new ConflictException('Coupon usage limit reached');
        }
        if (coupon.minOrderAmt && subtotal < Number(coupon.minOrderAmt)) {
            throw new ConflictException(
                `Minimum order of Rs. ${coupon.minOrderAmt} required`,
            );
        }

        // calculate discount
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, Number(coupon.maxDiscount));
            }
        } else if (coupon.type === 'FIXED') {
            discount = Number(coupon.value);
        }

        return {
            valid: true,
            code: coupon.code,
            type: coupon.type,
            discount,
            freeShipping: coupon.type === 'FREE_SHIPPING',
        };
    }

    async create(dto: CreateCouponDto) {
        const existing = await this.prisma.coupon.findUnique({
            where: { code: dto.code.toUpperCase() },
        });
        if (existing) throw new ConflictException('Coupon code already exists');

        return this.prisma.coupon.create({
            data: { ...dto, code: dto.code.toUpperCase() },
        });
    }

    async update(id: number, dto: Partial<CreateCouponDto>) {
        await this.findOne(id);
        return this.prisma.coupon.update({ where: { id }, data: dto as any });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.coupon.delete({ where: { id } });
        return { message: 'Coupon deleted successfully' };
    }

    async toggleActive(id: number) {
        const coupon = await this.findOne(id);
        return this.prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
        });
    }

    async getStats() {
        const [total, active, expired] = await this.prisma.$transaction([
            this.prisma.coupon.count(),
            this.prisma.coupon.count({ where: { isActive: true } }),
            this.prisma.coupon.count({
                where: {
                    expiresAt: { lt: new Date() },
                },
            }),
        ]);

        return { total, active, expired };
    }
}