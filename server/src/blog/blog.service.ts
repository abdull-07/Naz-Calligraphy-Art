import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { BlogQueryDto } from './dto/blog-query.dto';

@Injectable()
export class BlogService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async findAll(query: BlogQueryDto) {
        const { category, tag, search, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'PUBLISHED',
            ...(category && {
                category: { slug: category },
            }),
            ...(tag && {
                tags: { some: { slug: tag } },
            }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { excerpt: { contains: search, mode: 'insensitive' } },
                    { body: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [posts, total] = await this.prisma.$transaction([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: true,
                    publishedAt: true,
                    createdAt: true,
                    author: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    tags: {
                        select: { id: true, name: true, slug: true },
                    },
                },
            }),
            this.prisma.blogPost.count({ where }),
        ]);

        return {
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findBySlug(slug: string) {
        const post = await this.prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                category: {
                    select: { id: true, name: true, slug: true },
                },
                tags: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        if (!post || post.status !== 'PUBLISHED') {
            throw new NotFoundException(`Post "${slug}" not found`);
        }

        // get related posts from same category
        const related = await this.prisma.blogPost.findMany({
            where: {
                status: 'PUBLISHED',
                categoryId: post.categoryId,
                NOT: { id: post.id },
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                publishedAt: true,
            },
        });

        return { ...post, related };
    }

    async getCategories() {
        return this.prisma.blogCategory.findMany({
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { status: 'PUBLISHED' },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async getTags() {
        return this.prisma.blogTag.findMany({
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { status: 'PUBLISHED' },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAllAdmin(query: BlogQueryDto) {
        const { status, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [posts, total] = await this.prisma.$transaction([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true } },
                    category: { select: { id: true, name: true } },
                    tags: { select: { id: true, name: true } },
                    _count: { select: { tags: true } },
                },
            }),
            this.prisma.blogPost.count({ where }),
        ]);

        return {
            data: posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async create(dto: CreateBlogPostDto, authorId: number) {
        const slug = dto.slug ?? this.generateSlug(dto.title);

        // check slug uniqueness
        const existing = await this.prisma.blogPost.findUnique({
            where: { slug },
        });
        if (existing) throw new ConflictException(`Slug "${slug}" already exists`);

        // verify category exists
        const category = await this.prisma.blogCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Blog category not found');

        // handle tags — create if not exist
        const tagConnections = await this.handleTags(dto.tags ?? []);

        return this.prisma.blogPost.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt,
                body: dto.body,
                coverImage: dto.coverImage,
                status: dto.status ?? 'DRAFT',
                categoryId: dto.categoryId,
                authorId,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
                tags: { connect: tagConnections },
            },
            include: {
                author: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                tags: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async update(id: number, dto: UpdateBlogPostDto, userId: number) {
        const post = await this.prisma.blogPost.findUnique({
            where: { id },
        });
        if (!post) throw new NotFoundException(`Post #${id} not found`);

        // check slug uniqueness if changed
        if (dto.slug && dto.slug !== post.slug) {
            const existing = await this.prisma.blogPost.findFirst({
                where: { slug: dto.slug, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException(`Slug "${dto.slug}" already exists`);
            }
        }

        // handle tags
        const tagConnections =
            dto.tags !== undefined
                ? await this.handleTags(dto.tags)
                : undefined;

        // set publishedAt when status changes to PUBLISHED
        const publishedAt =
            dto.status === 'PUBLISHED' && post.status !== 'PUBLISHED'
                ? new Date()
                : undefined;

        return this.prisma.blogPost.update({
            where: { id },
            data: {
                title: dto.title,
                slug: dto.slug,
                excerpt: dto.excerpt,
                body: dto.body,
                coverImage: dto.coverImage,
                status: dto.status,
                categoryId: dto.categoryId,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                publishedAt,
                ...(tagConnections && {
                    tags: { set: tagConnections },
                }),
            },
            include: {
                author: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                tags: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async remove(id: number) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException(`Post #${id} not found`);

        await this.prisma.blogPost.delete({ where: { id } });
        return { message: 'Blog post deleted successfully' };
    }

    async publish(id: number) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException(`Post #${id} not found`);

        return this.prisma.blogPost.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: post.publishedAt ?? new Date(),
            },
        });
    }

    async unpublish(id: number) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException(`Post #${id} not found`);

        return this.prisma.blogPost.update({
            where: { id },
            data: { status: 'DRAFT' },
        });
    }

    // ─── BLOG CATEGORIES ─────────────────────────────────────────────────────

    async createCategory(dto: CreateBlogCategoryDto) {
        const slug = dto.slug ?? this.generateSlug(dto.name);

        const existing = await this.prisma.blogCategory.findUnique({
            where: { slug },
        });
        if (existing) throw new ConflictException(`Category slug "${slug}" already exists`);

        return this.prisma.blogCategory.create({
            data: { name: dto.name, slug },
        });
    }

    async updateCategory(id: number, dto: CreateBlogCategoryDto) {
        const category = await this.prisma.blogCategory.findUnique({
            where: { id },
        });
        if (!category) throw new NotFoundException('Blog category not found');

        return this.prisma.blogCategory.update({
            where: { id },
            data: dto,
        });
    }

    async removeCategory(id: number) {
        const category = await this.prisma.blogCategory.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } },
        });
        if (!category) throw new NotFoundException('Blog category not found');

        if (category._count.posts > 0) {
            throw new ForbiddenException(
                `Cannot delete category with ${category._count.posts} posts`,
            );
        }

        await this.prisma.blogCategory.delete({ where: { id } });
        return { message: 'Blog category deleted successfully' };
    }

    // ─── BLOG TAGS ────────────────────────────────────────────────────────────

    async createTag(name: string) {
        const slug = this.generateSlug(name);

        const existing = await this.prisma.blogTag.findUnique({ where: { slug } });
        if (existing) throw new ConflictException(`Tag "${name}" already exists`);

        return this.prisma.blogTag.create({ data: { name, slug } });
    }

    async removeTag(id: number) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Tag not found');

        await this.prisma.blogTag.delete({ where: { id } });
        return { message: 'Tag deleted successfully' };
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    private async handleTags(tagNames: string[]) {
        const connections: { id: number }[] = [];

        for (const name of tagNames) {
            const slug = this.generateSlug(name);

            // find or create tag
            let tag = await this.prisma.blogTag.findUnique({ where: { slug } });
            if (!tag) {
                tag = await this.prisma.blogTag.create({
                    data: { name, slug },
                });
            }
            connections.push({ id: tag.id });
        }

        return connections;
    }
}