import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // get all active top-level categories with their children
    async findAll() {
        return this.prisma.category.findMany({
            where: {
                isActive: true,
                parentId: null, // top-level only
            },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    // get single category by slug with its products count
    async findBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) throw new NotFoundException(`Category "${slug}" not found`);
        return category;
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // get all categories for admin (including inactive)
    async findAllAdmin() {
        return this.prisma.category.findMany({
            include: {
                parent: {
                    select: { id: true, name: true },
                },
                children: {
                    select: { id: true, name: true, isActive: true },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: [
                { parentId: 'asc' },
                { sortOrder: 'asc' },
            ],
        });
    }

    async create(dto: CreateCategoryDto) {
        // generate slug if not provided
        const slug = dto.slug ?? this.generateSlug(dto.name);

        // check slug uniqueness
        const existing = await this.prisma.category.findUnique({
            where: { slug },
        });
        if (existing) throw new ConflictException(`Slug "${slug}" already exists`);

        // validate parentId if provided
        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) throw new NotFoundException('Parent category not found');

            // prevent more than 2 levels deep
            if (parent.parentId) {
                throw new BadRequestException('Categories can only be 2 levels deep');
            }
        }

        return this.prisma.category.create({
            data: {
                ...dto,
                slug,
            },
            include: {
                parent: { select: { id: true, name: true } },
                children: true,
            },
        });
    }

    async update(id: number, dto: UpdateCategoryDto) {
        await this.findById(id);

        // if slug is being changed check uniqueness
        if (dto.slug) {
            const existing = await this.prisma.category.findFirst({
                where: { slug: dto.slug, NOT: { id } },
            });
            if (existing) throw new ConflictException(`Slug "${dto.slug}" already exists`);
        }

        // prevent category from being its own parent
        if (dto.parentId === id) {
            throw new BadRequestException('Category cannot be its own parent');
        }

        return this.prisma.category.update({
            where: { id },
            data: dto,
            include: {
                parent: { select: { id: true, name: true } },
                children: true,
                _count: { select: { products: true } },
            },
        });
    }

    async remove(id: number) {
        const category = await this.findById(id);

        // check if category has products
        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });
        if (productCount > 0) {
            throw new BadRequestException(
                `Cannot delete category with ${productCount} products. Move or delete products first.`,
            );
        }

        // check if category has children
        const childCount = await this.prisma.category.count({
            where: { parentId: id },
        });
        if (childCount > 0) {
            throw new BadRequestException(
                `Cannot delete category with ${childCount} subcategories. Delete subcategories first.`,
            );
        }

        await this.prisma.category.delete({ where: { id } });
        return { message: `Category "${category.name}" deleted successfully` };
    }

    async reorder(ids: number[]) {
        // update sortOrder based on position in array
        await Promise.all(
            ids.map((id, index) =>
                this.prisma.category.update({
                    where: { id },
                    data: { sortOrder: index },
                }),
            ),
        );

        return { message: 'Categories reordered successfully' };
    }

    async toggleActive(id: number) {
        const category = await this.findById(id);

        return this.prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive },
        });
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private async findById(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) throw new NotFoundException(`Category #${id} not found`);
        return category;
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }
}