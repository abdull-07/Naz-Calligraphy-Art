import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // GET all with filters
  async findAll(filters: {
    category?: string;
    page: number;
    limit: number;
    sort?: string;
    featured?: boolean;
  }) {
    const { category, page, limit, sort, featured } = filters;
    const skip = (page - 1) * limit;

    // build orderBy from sort param
    const orderBy = this.buildOrderBy(sort);

    const where = {
      status: 'ACTIVE' as const,
      ...(featured && { isFeatured: true }),
      ...(category && {
        category: { slug: category },
      }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            orderBy: { sortOrder: 'asc' },
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

  // GET single by slug
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundException(`Product "${slug}" not found`);

    return product;
  }

  // POST create
  async create(dto: CreateProductDto) {
    const slug = this.generateSlug(dto.name);

    return this.prisma.product.create({
      data: {
        ...dto,
        slug,
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
  }

  // PATCH update
  async update(id: number, dto: UpdateProductDto) {
    await this.findById(id);

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findById(id);

    // soft delete — set status to ARCHIVED instead of deleting
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

  private async findById(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
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
      case 'price_asc':  return { variants: { _count: 'asc' as const } };
      case 'price_desc': return { variants: { _count: 'desc' as const } };
      case 'newest':     return { createdAt: 'desc' as const };
      default:           return { createdAt: 'desc' as const };
    }
  }
}