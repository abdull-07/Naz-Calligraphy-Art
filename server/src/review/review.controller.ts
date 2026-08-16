import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // GET /api/v1/reviews/product/:productId
    @Get('product/:productId')
    getProductReviews(
        @Param('productId', ParseIntPipe) productId: number,
        @Query() query: ReviewQueryDto,
    ) {
        return this.reviewService.getProductReviews(productId, query);
    }

    // GET /api/v1/reviews/product/:productId/summary
    @Get('product/:productId/summary')
    getRatingSummary(@Param('productId', ParseIntPipe) productId: number) {
        return this.reviewService.getRatingSummary(productId);
    }

    // ─── CUSTOMER ─────────────────────────────────────────────────────────────

    // GET /api/v1/reviews/my
    @Get('my')
    @UseGuards(JwtAuthGuard)
    getMyReviews(@CurrentUser('id') userId: number) {
        return this.reviewService.getMyReviews(userId);
    }

    // POST /api/v1/reviews
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() dto: CreateReviewDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.reviewService.create(dto, userId);
    }

    // PATCH /api/v1/reviews/:id
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe) reviewId: number,
        @CurrentUser('id') userId: number,
        @Body() dto: Partial<CreateReviewDto>,
    ) {
        return this.reviewService.update(reviewId, userId, dto);
    }

    // DELETE /api/v1/reviews/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    remove(
        @Param('id', ParseIntPipe) reviewId: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.reviewService.remove(reviewId, userId);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/reviews
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAllAdmin(@Query() query: ReviewQueryDto) {
        return this.reviewService.findAllAdmin(query);
    }

    // PATCH /api/v1/reviews/:id/moderate
    @Patch(':id/moderate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    moderate(
        @Param('id', ParseIntPipe) reviewId: number,
        @Body() dto: ModerateReviewDto,
    ) {
        return this.reviewService.moderate(reviewId, dto);
    }

    // PATCH /api/v1/reviews/bulk-moderate
    @Patch('bulk/moderate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    bulkModerate(
        @Body('ids') ids: number[],
        @Body('status') status: string,
    ) {
        return this.reviewService.bulkModerate(ids, status);
    }

    // DELETE /api/v1/reviews/:id/admin
    @Delete(':id/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    adminRemove(@Param('id', ParseIntPipe) reviewId: number) {
        return this.reviewService.adminRemove(reviewId);
    }
}