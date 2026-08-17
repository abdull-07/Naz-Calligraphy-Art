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
import { DashboardService } from './services/dashboard.service';
import { ReportsService } from './services/reports.service';
import { BannerService } from './services/banner.service';
import { FaqService } from './services/faq.service';
import { CouponService } from './services/coupon.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class AdminController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly reportsService: ReportsService,
        private readonly bannerService: BannerService,
        private readonly faqService: FaqService,
        private readonly couponService: CouponService,
    ) { }

    // ─── DASHBOARD ───────────────────────────────────────────────────────────

    @Get('dashboard')
    getDashboard() {
        return this.dashboardService.getDashboard();
    }

    @Get('dashboard/chart')
    getSalesChart(@Query('period') period: '7d' | '30d' | '90d') {
        return this.dashboardService.getSalesChart(period ?? '30d');
    }

    @Get('dashboard/top-products')
    getTopProducts(@Query('limit') limit?: string) {
        return this.dashboardService.getTopProducts(
            limit ? parseInt(limit) : 10,
        );
    }

    // ─── REPORTS ─────────────────────────────────────────────────────────────

    @Get('reports/revenue')
    getRevenueReport(@Query() query: AdminQueryDto) {
        return this.reportsService.getRevenueReport(query);
    }

    @Get('reports/sales')
    getSalesReport(@Query() query: AdminQueryDto) {
        return this.reportsService.getSalesReport(query);
    }

    @Get('reports/refunds')
    getRefundReport(@Query() query: AdminQueryDto) {
        return this.reportsService.getRefundReport(query);
    }

    @Get('reports/low-stock')
    getLowStockReport() {
        return this.reportsService.getLowStockReport();
    }

    @Get('reports/customers')
    getCustomerReport(@Query() query: AdminQueryDto) {
        return this.reportsService.getCustomerReport(query);
    }

    // ─── BANNERS ─────────────────────────────────────────────────────────────

    @Get('banners')
    getBanners() {
        return this.bannerService.findAll();
    }

    @Post('banners')
    @HttpCode(HttpStatus.CREATED)
    createBanner(@Body() body: any) {
        return this.bannerService.create(body);
    }

    @Patch('banners/reorder')
    reorderBanners(@Body('ids') ids: number[]) {
        return this.bannerService.reorder(ids);
    }

    @Patch('banners/:id')
    updateBanner(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.bannerService.update(id, body);
    }

    @Patch('banners/:id/toggle')
    toggleBanner(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.toggleActive(id);
    }

    @Delete('banners/:id')
    @HttpCode(HttpStatus.OK)
    deleteBanner(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.remove(id);
    }

    // ─── FAQS ────────────────────────────────────────────────────────────────

    @Get('faqs')
    getFaqs(@Query('category') category?: string) {
        return this.faqService.findAll(category);
    }

    @Get('faqs/categories')
    getFaqCategories() {
        return this.faqService.getCategories();
    }

    @Post('faqs')
    @HttpCode(HttpStatus.CREATED)
    createFaq(@Body() body: any) {
        return this.faqService.create(body);
    }

    @Patch('faqs/reorder')
    reorderFaqs(@Body('ids') ids: number[]) {
        return this.faqService.reorder(ids);
    }

    @Patch('faqs/:id')
    updateFaq(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.faqService.update(id, body);
    }

    @Delete('faqs/:id')
    @HttpCode(HttpStatus.OK)
    deleteFaq(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.remove(id);
    }

    // ─── COUPONS ─────────────────────────────────────────────────────────────

    @Get('coupons')
    getCoupons() {
        return this.couponService.findAll();
    }

    @Get('coupons/stats')
    getCouponStats() {
        return this.couponService.getStats();
    }

    @Post('coupons/validate')
    @HttpCode(HttpStatus.OK)
    validateCoupon(
        @Body('code') code: string,
        @Body('subtotal') subtotal: number,
    ) {
        return this.couponService.validate(code, subtotal);
    }

    @Post('coupons')
    @HttpCode(HttpStatus.CREATED)
    createCoupon(@Body() body: any) {
        return this.couponService.create(body);
    }

    @Patch('coupons/:id')
    updateCoupon(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.couponService.update(id, body);
    }

    @Patch('coupons/:id/toggle')
    toggleCoupon(@Param('id', ParseIntPipe) id: number) {
        return this.couponService.toggleActive(id);
    }

    @Delete('coupons/:id')
    @HttpCode(HttpStatus.OK)
    deleteCoupon(@Param('id', ParseIntPipe) id: number) {
        return this.couponService.remove(id);
    }
}