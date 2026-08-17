import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DashboardService } from './services/dashboard.service';
import { BannerService } from './services/banner.service';
import { CouponService } from './services/coupon.service';
import { FaqService } from './services/faq.service';
import { ReportsService } from './services/reports.service';


@Module({
    controllers: [AdminController],
    providers: [DashboardService, BannerService, CouponService, FaqService, ReportsService],
    exports: [DashboardService, BannerService, CouponService, FaqService, ReportsService],
})
export class AdminModule { }