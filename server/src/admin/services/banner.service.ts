import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateBannerDto {
    imageUrl: string;
    linkUrl?: string;
    altText?: string;
    heading?: string;
    subtext?: string;
    sortOrder?: number;
    isActive?: boolean;
    startsAt?: Date;
    endsAt?: Date;
}

@Injectable()
export class BannerService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.banner.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.banner.findMany({
            where: {
                isActive: true,
                OR: [
                    { startsAt: null },
                    { startsAt: { lte: now } },
                ],
                AND: [
                    {
                        OR: [
                            { endsAt: null },
                            { endsAt: { gte: now } },
                        ],
                    },
                ],
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async create(dto: CreateBannerDto) {
        return this.prisma.banner.create({ data: dto });
    }

    async update(id: number, dto: Partial<CreateBannerDto>) {
        await this.findById(id);
        return this.prisma.banner.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findById(id);
        await this.prisma.banner.delete({ where: { id } });
        return { message: 'Banner deleted successfully' };
    }

    async reorder(ids: number[]) {
        await Promise.all(
            ids.map((id, index) =>
                this.prisma.banner.update({
                    where: { id },
                    data: { sortOrder: index },
                }),
            ),
        );
        return { message: 'Banners reordered successfully' };
    }

    async toggleActive(id: number) {
        const banner = await this.findById(id);
        return this.prisma.banner.update({
            where: { id },
            data: { isActive: !banner.isActive },
        });
    }

    private async findById(id: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) throw new NotFoundException(`Banner #${id} not found`);
        return banner;
    }
}