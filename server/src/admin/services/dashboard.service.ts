import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const [
            todayOrders,
            todayRevenue,
            monthOrders,
            monthRevenue,
            lastMonthRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            pendingOrders,
            processingOrders,
            shippedOrders,
            lowStockVariants,
            outOfStockVariants,
            recentOrders,
            recentCustomers,
            pendingReviews,
            unreadMessages,
        ] = await this.prisma.$transaction([

            this.prisma.order.count({
                where: { createdAt: { gte: today } },
            }),

            this.prisma.order.aggregate({
                where: { createdAt: { gte: today }, paymentStatus: 'PAID' },
                _sum: { total: true },
            }),

            this.prisma.order.count({
                where: { createdAt: { gte: thisMonthStart } },
            }),

            this.prisma.order.aggregate({
                where: { createdAt: { gte: thisMonthStart }, paymentStatus: 'PAID' },
                _sum: { total: true },
            }),

            this.prisma.order.aggregate({
                where: {
                    createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
                    paymentStatus: 'PAID',
                },
                _sum: { total: true },
            }),

            this.prisma.order.count(),

            this.prisma.user.count({
                where: { role: 'CUSTOMER', isActive: true },
            }),

            this.prisma.product.count({
                where: { status: 'ACTIVE' },
            }),

            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.order.count({ where: { status: 'PROCESSING' } }),
            this.prisma.order.count({ where: { status: 'SHIPPED' } }),

            this.prisma.productVariant.count({
                where: { stockStatus: 'LOW_STOCK' },
            }),

            this.prisma.productVariant.count({
                where: { stockStatus: 'OUT_OF_STOCK' },
            }),

            this.prisma.order.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    payment: { select: { provider: true, status: true } },
                    items: { select: { productName: true, quantity: true }, take: 1 },
                },
            }),

            this.prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
            }),

            this.prisma.review.count({ where: { status: 'PENDING' } }),
            this.prisma.contactMessage.count({ where: { isRead: false } }),
        ]);

        const thisMonthTotal = Number(monthRevenue._sum.total ?? 0);
        const lastMonthTotal = Number(lastMonthRevenue._sum.total ?? 0);
        const revenueGrowth = lastMonthTotal === 0
            ? 100
            : Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);

        return {
            kpis: {
                today: {
                    orders: todayOrders,
                    revenue: Number(todayRevenue._sum.total ?? 0),
                },
                thisMonth: {
                    orders: monthOrders,
                    revenue: thisMonthTotal,
                    revenueGrowth,
                },
                totals: {
                    orders: totalOrders,
                    customers: totalCustomers,
                    products: totalProducts,
                },
            },
            orderStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                shipped: shippedOrders,
            },
            inventory: {
                lowStock: lowStockVariants,
                outOfStock: outOfStockVariants,
            },
            alerts: {
                pendingReviews,
                unreadMessages,
                lowStockVariants,
                outOfStockVariants,
            },
            recentOrders,
            recentCustomers,
        };
    }

    async getSalesChart(period: '7d' | '30d' | '90d' = '30d') {
        const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: startDate },
                paymentStatus: 'PAID',
            },
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        // initialize all dates with 0
        const chartData: Record<string, { date: string; orders: number; revenue: number }> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const key = date.toISOString().split('T')[0];
            chartData[key] = { date: key, orders: 0, revenue: 0 };
        }

        // fill actual data
        for (const order of orders) {
            const key = order.createdAt.toISOString().split('T')[0];
            if (chartData[key]) {
                chartData[key].orders++;
                chartData[key].revenue += Number(order.total);
            }
        }

        return Object.values(chartData);
    }

    async getTopProducts(limit = 10) {
        const result = await this.prisma.orderItem.groupBy({
            by: ['productId', 'productName'],
            _sum: { quantity: true, subtotal: true },
            _count: { id: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });

        return result.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            totalSold: item._sum.quantity ?? 0,
            totalRevenue: Number(item._sum.subtotal ?? 0),
            totalOrders: item._count.id,
        }));
    }
}