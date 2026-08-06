import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import type { Express } from 'express';

@Injectable()
export class ProductService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async findAll(query: ProductQueryDto) {
        const {
            category,
            search,
            sort,
            tags,
            featured,
            inStock,
            page = 1,
            limit = 20,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE',
            ...(featured === 'true' && { isFeatured: true }),
            ...(inStock === 'true' && {
                variants: { some: { stockQty: { gt: 0 } } },
            }),
            ...(tags && {
                tags: { hasSome: tags.split(',') },
            }),
            ...(category && {
                category: { slug: category },
            }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const orderBy = this.buildOrderBy(sort);

        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    variants: {
                        orderBy: { sortOrder: 'asc' },
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: {
                    include: {
                        parent: { select: { id: true, name: true, slug: true } },
                    },
                },
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { orderBy: { sortOrder: 'asc' } },
                reviews: {
                    where: { status: 'APPROVED' },
                    include: {
                        user: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        });

        if (!product) throw new NotFoundException(`Product "${slug}" not found`);
        return product;
    }

    // ─── ADMIN — PRODUCTS ────────────────────────────────────────────────────

    async findAllAdmin(query: ProductQueryDto) {
        const { search, category, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(category && { category: { slug: category } }),
        };

        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { id: true, name: true } },
                    images: { where: { isPrimary: true }, take: 1 },
                    variants: { orderBy: { sortOrder: 'asc' } },
                    _count: { select: { reviews: true, orderItems: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async create(dto: CreateProductDto) {
        const slug = dto.slug ?? this.generateSlug(dto.name);

        // check slug uniqueness
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing) throw new ConflictException(`Slug "${slug}" already exists`);

        // verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');

        return this.prisma.product.create({
            data: { ...dto, slug },
            include: {
                category: true,
                variants: true,
                images: true,
            },
        });
    }

    async update(id: number, dto: UpdateProductDto) {
        await this.findById(id);

        if (dto.slug) {
            const existing = await this.prisma.product.findFirst({
                where: { slug: dto.slug, NOT: { id } },
            });
            if (existing) throw new ConflictException(`Slug "${dto.slug}" already exists`);
        }

        return this.prisma.product.update({
            where: { id },
            data: dto,
            include: { category: true, variants: true, images: true },
        });
    }

    async remove(id: number) {
        const product = await this.findById(id);

        return this.prisma.product.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }

    // ─── VARIANTS ────────────────────────────────────────────────────────────

    async findVariants(productId: number) {
        await this.findById(productId);
        return this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async createVariant(productId: number, dto: CreateVariantDto) {
        await this.findById(productId);

        if (dto.sku) {
            const existing = await this.prisma.productVariant.findUnique({
                where: { sku: dto.sku },
            });
            if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists`);
        }

        if (dto.isDefault) {
            await this.prisma.productVariant.updateMany({
                where: { productId },
                data: { isDefault: false },
            });
        }

        const variant = await this.prisma.productVariant.create({
            data: { ...dto, productId },
        });

        await this.updateStockStatus(variant.id, variant.stockQty, variant.lowStockAlert);
        return variant;
    }

    async updateVariant(productId: number, variantId: number, dto: UpdateVariantDto) {
        await this.findById(productId);
        await this.findVariantById(variantId, productId);

        if (dto.isDefault) {
            await this.prisma.productVariant.updateMany({
                where: { productId },
                data: { isDefault: false },
            });
        }

        const updated = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: dto,
        });

        if (dto.stockQty !== undefined) {
            await this.updateStockStatus(
                variantId,
                updated.stockQty,
                updated.lowStockAlert,
            );
        }

        return updated;
    }

    async removeVariant(productId: number, variantId: number) {
        await this.findById(productId);
        await this.findVariantById(variantId, productId);
        return this.prisma.productVariant.delete({ where: { id: variantId } });
    }

    // ─── IMAGES ──────────────────────────────────────────────────────────────

    async findImages(productId: number) {
        await this.findById(productId);
        return this.prisma.productImage.findMany({
            where: { productId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async uploadImage(
        productId: number,
        file: Express.Multer.File,
        options: { altText?: string; isPrimary?: boolean },
    ) {
        await this.findById(productId);

        const url = await this.cloudinary.upload(file);

        if (options.isPrimary) {
            await this.prisma.productImage.updateMany({
                where: { productId },
                data: { isPrimary: false },
            });
        }

        const last = await this.prisma.productImage.findFirst({
            where: { productId },
            orderBy: { sortOrder: 'desc' },
        });

        return this.prisma.productImage.create({
            data: {
                productId,
                url,
                altText: options.altText,
                isPrimary: options.isPrimary ?? false,
                sortOrder: last ? last.sortOrder + 1 : 0,
            },
        });
    }

    async reorderImages(productId: number, dto: ReorderImagesDto) {
        await this.findById(productId);

        await Promise.all(
            dto.imageIds.map((imageId, index) =>
                this.prisma.productImage.update({
                    where: { id: imageId },
                    data: { sortOrder: index },
                }),
            ),
        );

        return this.findImages(productId);
    }

    async removeImage(productId: number, imageId: number) {
        await this.findById(productId);

        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId },
        });
        if (!image) throw new NotFoundException(`Image #${imageId} not found`);

        await this.cloudinary.delete(image.url);
        return this.prisma.productImage.delete({ where: { id: imageId } });
    }

    // ─── INVENTORY ───────────────────────────────────────────────────────────

    async getInventory(productId: number) {
        await this.findById(productId);
        return this.prisma.productVariant.findMany({
            where: { productId },
            select: {
                id: true,
                label: true,
                sku: true,
                stockQty: true,
                stockStatus: true,
                lowStockAlert: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async adjustInventory(productId: number, dto: AdjustInventoryDto, adminId: number) {
        await this.findById(productId);
        const variant = await this.findVariantById(dto.variantId, productId);

        const newQty = variant.stockQty + dto.changeQty;
        if (newQty < 0) {
            throw new BadRequestException('Stock quantity cannot go below 0');
        }

        const updated = await this.prisma.productVariant.update({
            where: { id: dto.variantId },
            data: { stockQty: newQty },
        });

        await this.updateStockStatus(dto.variantId, newQty, variant.lowStockAlert);

        await this.prisma.inventoryLog.create({
            data: {
                variantId: dto.variantId,
                changeQty: dto.changeQty,
                reason: dto.reason,
                adminId,
            },
        });

        return updated;
    }

    async getInventoryLogs(productId: number) {
        await this.findById(productId);
        return this.prisma.inventoryLog.findMany({
            where: { variant: { productId } },
            include: {
                variant: { select: { id: true, label: true, sku: true } },
                admin: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    async findById(id: number) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException(`Product #${id} not found`);
        return product;
    }

    private async findVariantById(variantId: number, productId: number) {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);
        return variant;
    }

    private async updateStockStatus(
        variantId: number,
        stockQty: number,
        lowStockAlert: number,
    ) {
        const stockStatus =
            stockQty <= 0
                ? 'OUT_OF_STOCK'
                : stockQty <= lowStockAlert
                    ? 'LOW_STOCK'
                    : 'IN_STOCK';

        await this.prisma.productVariant.update({
            where: { id: variantId },
            data: { stockStatus },
        });
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    private buildOrderBy(sort?: string) {
        switch (sort) {
            case 'price_asc': return { variants: { _count: 'asc' as const } };
            case 'price_desc': return { variants: { _count: 'desc' as const } };
            case 'newest': return { createdAt: 'desc' as const };
            case 'oldest': return { createdAt: 'asc' as const };
            default: return { createdAt: 'desc' as const };
        }
    }
}