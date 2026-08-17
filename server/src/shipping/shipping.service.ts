import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@Injectable()
export class ShippingService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async calculateRate(dto: CalculateShippingDto) {
        const { country, weightKg = 0, productIds = [] } = dto;

        // check if any products are local shipping only
        if (productIds.length > 0 && country !== 'PK') {
            const localOnlyProducts = await this.prisma.product.findMany({
                where: {
                    id: { in: productIds },
                    localShippingOnly: true,
                },
                select: { id: true, name: true },
            });

            if (localOnlyProducts.length > 0) {
                throw new BadRequestException({
                    message: 'Some products are only available for local shipping',
                    products: localOnlyProducts,
                });
            }
        }

        // find matching shipping zone
        const zone = await this.prisma.shippingZone.findFirst({
            where: {
                isActive: true,
                countries: { has: country },
            },
        });

        if (!zone) {
            // fallback — check if there is a global zone
            const globalZone = await this.prisma.shippingZone.findFirst({
                where: {
                    isActive: true,
                    name: { contains: 'Global', mode: 'insensitive' },
                },
            });

            if (!globalZone) {
                throw new NotFoundException(
                    `Shipping is not available to ${country}`,
                );
            }

            return this.calculateZoneRate(globalZone, weightKg);
        }

        return this.calculateZoneRate(zone, weightKg);
    }

    async getActiveZones() {
        return this.prisma.shippingZone.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async getZoneByCountry(country: string) {
        const zone = await this.prisma.shippingZone.findFirst({
            where: {
                isActive: true,
                countries: { has: country },
            },
        });

        if (!zone) throw new NotFoundException(`No shipping zone for ${country}`);
        return zone;
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAll() {
        return this.prisma.shippingZone.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }

    async findOne(id: number) {
        const zone = await this.prisma.shippingZone.findUnique({
            where: { id },
        });
        if (!zone) throw new NotFoundException(`Shipping zone #${id} not found`);
        return zone;
    }

    async create(dto: CreateShippingZoneDto) {
        // validate perKgRate is provided for PER_KG type
        if (dto.rateType === 'PER_KG' && !dto.perKgRate) {
            throw new BadRequestException(
                'perKgRate is required for PER_KG rate type',
            );
        }

        return this.prisma.shippingZone.create({
            data: {
                name: dto.name,
                countries: dto.countries,
                rateType: dto.rateType ?? 'FLAT',
                baseRate: dto.baseRate ?? 0,
                perKgRate: dto.perKgRate ?? null,
                minDays: dto.minDays ?? null,
                maxDays: dto.maxDays ?? null,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async update(id: number, dto: UpdateShippingZoneDto) {
        await this.findOne(id);
        return this.prisma.shippingZone.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.shippingZone.delete({ where: { id } });
        return { message: 'Shipping zone deleted successfully' };
    }

    async toggleActive(id: number) {
        const zone = await this.findOne(id);
        return this.prisma.shippingZone.update({
            where: { id },
            data: { isActive: !zone.isActive },
        });
    }

    async seedDefaultZones() {
        const existing = await this.prisma.shippingZone.count();
        if (existing > 0) {
            return { message: 'Shipping zones already exist' };
        }

        await this.prisma.shippingZone.createMany({
            data: [
                {
                    name: 'Pakistan Domestic',
                    countries: ['PK'],
                    rateType: 'FLAT',
                    baseRate: 150,
                    minDays: 2,
                    maxDays: 5,
                    isActive: true,
                },
                {
                    name: 'Middle East',
                    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
                    rateType: 'PER_KG',
                    baseRate: 800,
                    perKgRate: 200,
                    minDays: 7,
                    maxDays: 14,
                    isActive: true,
                },
                {
                    name: 'United Kingdom',
                    countries: ['GB'],
                    rateType: 'PER_KG',
                    baseRate: 1200,
                    perKgRate: 300,
                    minDays: 10,
                    maxDays: 21,
                    isActive: true,
                },
                {
                    name: 'United States & Canada',
                    countries: ['US', 'CA'],
                    rateType: 'PER_KG',
                    baseRate: 1500,
                    perKgRate: 350,
                    minDays: 10,
                    maxDays: 21,
                    isActive: true,
                },
                {
                    name: 'Europe',
                    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK'],
                    rateType: 'PER_KG',
                    baseRate: 1300,
                    perKgRate: 300,
                    minDays: 10,
                    maxDays: 21,
                    isActive: true,
                },
                {
                    name: 'Australia & New Zealand',
                    countries: ['AU', 'NZ'],
                    rateType: 'PER_KG',
                    baseRate: 1600,
                    perKgRate: 400,
                    minDays: 14,
                    maxDays: 28,
                    isActive: true,
                },
            ],
        });

        return { message: 'Default shipping zones created successfully' };
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private calculateZoneRate(zone: any, weightKg: number) {
        let shippingFee = Number(zone.baseRate);

        if (zone.rateType === 'PER_KG' && weightKg > 0) {
            shippingFee += weightKg * Number(zone.perKgRate ?? 0);
        }

        if (zone.rateType === 'FREE') {
            shippingFee = 0;
        }

        return {
            zone: zone.name,
            rateType: zone.rateType,
            shippingFee: Math.round(shippingFee),
            currency: 'PKR',
            estimatedDelivery: {
                minDays: zone.minDays,
                maxDays: zone.maxDays,
                label: zone.minDays && zone.maxDays
                    ? `${zone.minDays}–${zone.maxDays} business days`
                    : 'Delivery time varies',
            },
        };
    }
}