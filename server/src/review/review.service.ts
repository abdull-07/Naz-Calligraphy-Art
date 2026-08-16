import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async getProductReviews(productId: number, query: ReviewQueryDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        // verify product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        const [reviews, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where: { productId, status: 'APPROVED' },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                },
            }),
            this.prisma.review.count({
                where: { productId, status: 'APPROVED' },
            }),
        ]);

        // calculate rating summary
        const ratingSummary = await this.getRatingSummary(productId);

        return {
            data: reviews,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            ratingSummary,
        };
    }

    async getRatingSummary(productId: number) {
        const reviews = await this.prisma.review.findMany({
            where: { productId, status: 'APPROVED' },
            select: { rating: true },
        });

        if (reviews.length === 0) {
            return {
                average: 0,
                total: 0,
                breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let total = 0;

        for (const review of reviews) {
            breakdown[review.rating as keyof typeof breakdown]++;
            total += review.rating;
        }

        return {
            average: Number((total / reviews.length).toFixed(1)),
            total: reviews.length,
            breakdown,
        };
    }

    // ─── CUSTOMER ─────────────────────────────────────────────────────────────

    async create(dto: CreateReviewDto, userId: number) {
        // verify product exists
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        // verify purchase if orderId provided
        if (dto.orderId) {
            const orderItem = await this.prisma.orderItem.findFirst({
                where: {
                    orderId: dto.orderId,
                    productId: dto.productId,
                    order: { userId },
                },
            });

            if (!orderItem) {
                throw new BadRequestException(
                    'You can only review products you have purchased',
                );
            }
        }

        // check duplicate review
        const existing = await this.prisma.review.findFirst({
            where: {
                userId,
                productId: dto.productId,
                ...(dto.orderId && { orderId: dto.orderId }),
            },
        });
        if (existing) {
            throw new ConflictException('You have already reviewed this product');
        }

        return this.prisma.review.create({
            data: {
                ...dto,
                userId,
                status: 'PENDING',
            },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async getMyReviews(userId: number) {
        return this.prisma.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(reviewId: number, userId: number, dto: Partial<CreateReviewDto>) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, userId },
        });
        if (!review) throw new NotFoundException('Review not found');

        if (review.status === 'APPROVED') {
            throw new BadRequestException('Cannot edit an approved review');
        }

        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                ...dto,
                status: 'PENDING', // re-submit for moderation
            },
        });
    }

    async remove(reviewId: number, userId: number) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, userId },
        });
        if (!review) throw new NotFoundException('Review not found');

        await this.prisma.review.delete({ where: { id: reviewId } });
        return { message: 'Review deleted successfully' };
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAllAdmin(query: ReviewQueryDto) {
        const { status, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(search && {
                OR: [
                    { body: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { product: { name: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };

        const [reviews, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    product: { select: { id: true, name: true, slug: true } },
                },
            }),
            this.prisma.review.count({ where }),
        ]);

        return {
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async moderate(reviewId: number, dto: ModerateReviewDto) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) throw new NotFoundException('Review not found');

        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                status: dto.status,
                ...(dto.adminReply && { adminReply: dto.adminReply }),
            },
            include: {
                user: { select: { id: true, name: true } },
                product: { select: { id: true, name: true } },
            },
        });
    }

    async bulkModerate(ids: number[], status: string) {
        await this.prisma.review.updateMany({
            where: { id: { in: ids } },
            data: { status: status as any },
        });

        return { message: `${ids.length} reviews updated to ${status}` };
    }

    async adminRemove(reviewId: number) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) throw new NotFoundException('Review not found');

        await this.prisma.review.delete({ where: { id: reviewId } });
        return { message: 'Review deleted successfully' };
    }
}