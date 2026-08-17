import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateFaqDto {
    question: string;
    answer: string;
    category: string;
    sortOrder?: number;
    isActive?: boolean;
}

@Injectable()
export class FaqService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(category?: string) {
        return this.prisma.faq.findMany({
            where: {
                ...(category && { category }),
            },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }

    async findAllPublic(category?: string) {
        return this.prisma.faq.findMany({
            where: {
                isActive: true,
                ...(category && { category }),
            },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }

    async getCategories() {
        const faqs = await this.prisma.faq.findMany({
            where: { isActive: true },
            select: { category: true },
            distinct: ['category'],
        });
        return faqs.map((f) => f.category);
    }

    async create(dto: CreateFaqDto) {
        return this.prisma.faq.create({ data: dto });
    }

    async update(id: number, dto: Partial<CreateFaqDto>) {
        await this.findById(id);
        return this.prisma.faq.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findById(id);
        await this.prisma.faq.delete({ where: { id } });
        return { message: 'FAQ deleted successfully' };
    }

    async reorder(ids: number[]) {
        await Promise.all(
            ids.map((id, index) =>
                this.prisma.faq.update({
                    where: { id },
                    data: { sortOrder: index },
                }),
            ),
        );
        return { message: 'FAQs reordered successfully' };
    }

    private async findById(id: number) {
        const faq = await this.prisma.faq.findUnique({ where: { id } });
        if (!faq) throw new NotFoundException(`FAQ #${id} not found`);
        return faq;
    }
}