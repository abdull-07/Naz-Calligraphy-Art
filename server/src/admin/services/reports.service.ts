import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminQueryDto } from '../dto/admin-query.dto';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getRevenueReport(query: AdminQueryDto) {
        const { from, to, page = 1, limit = 30 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            paymentStatus: 'PAID',
            ...this.buildDateFilter(from, to),
        };

        const [orders, total, aggregate] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    subtotal: true,
                    shippingFee: true,
                    discount: true,
                    total: true,
                    paymentStatus: true,
                    createdAt: true,
                    user: { select: { id: true, name: true, email: true } },
                    payment: { select: { provider: true, paidAt: true } },
                },
            }),
            this.prisma.order.count({ where }),
            this.prisma.order.aggregate({
                where,
                _sum: { subtotal: true, shippingFee: true, discount: true, total: true },
                _count: { id: true },
                _avg: { total: true },
            }),
        ]);

        return {
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            summary: {
                totalOrders: aggregate._count.id,
                totalSubtotal: Number(aggregate._sum.subtotal ?? 0),
                totalShipping: Number(aggregate._sum.shippingFee ?? 0),
                totalDiscount: Number(aggregate._sum.discount ?? 0),
                totalRevenue: Number(aggregate._sum.total ?? 0),
                averageOrder: Number(aggregate._avg.total ?? 0).toFixed(2),
            },
        };
    }

    async getSalesReport(query: AdminQueryDto) {
        const { from, to } = query;
        const dateFilter = this.buildDateFilter(from, to);

        const [
            totalOrders,
            paidOrders,
            pendingOrders,
            cancelledOrders,
            refundedOrders,
            revenue,
            topProducts,
            salesByProvider,
        ] = await this.prisma.$transaction([

            this.prisma.order.count({ where: { ...dateFilter } }),

            this.prisma.order.count({
                where: { ...dateFilter, paymentStatus: 'PAID' },
            }),

            this.prisma.order.count({
                where: { ...dateFilter, status: 'PENDING' },
            }),

            this.prisma.order.count({
                where: { ...dateFilter, status: 'CANCELLED' },
            }),

            this.prisma.order.count({
                where: { ...dateFilter, status: 'REFUNDED' },
            }),

            this.prisma.order.aggregate({
                where: { ...dateFilter, paymentStatus: 'PAID' },
                _sum: { total: true },
            }),

            this.prisma.orderItem.groupBy({
                by: ['productId', 'productName'],
                where: { order: { ...dateFilter } },
                _sum: { quantity: true, subtotal: true },
                orderBy: { _sum: { subtotal: 'desc' } },
                take: 5,
            }),

            this.prisma.payment.groupBy({
                by: ['provider'],
                where: { order: { ...dateFilter, paymentStatus: 'PAID' } },
                _count: { id: true },
                _sum: { amount: true },
                orderBy: { _count: { id: 'desc' } },
            }),
        ]);

        return {
            overview: {
                totalOrders,
                paidOrders,
                pendingOrders,
                cancelledOrders,
                refundedOrders,
                totalRevenue: Number(revenue._sum.total ?? 0),
                conversionRate: totalOrders > 0
                    ? Math.round((paidOrders / totalOrders) * 100)
                    : 0,
            },
            topProducts: topProducts.map((p) => ({
                productId: p.productId,
                productName: p.productName,
                unitsSold: p._sum?.quantity ?? 0,
                revenue: Number(p._sum?.subtotal ?? 0),
            })),
            salesByProvider: salesByProvider.map((p) => {
                const countObj = p._count as any;
                const count = typeof countObj === 'number' ? countObj : (countObj?.id ?? countObj?._all ?? 0);
                return {
                    provider: p.provider,
                    orders: count,
                    revenue: Number(p._sum?.amount ?? 0),
                };
            }),
        };
    }

    async getRefundReport(query: AdminQueryDto) {
        const { from, to, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = { ...this.buildDateFilter(from, to) };

        const [refunds, total, aggregate] = await this.prisma.$transaction([
            this.prisma.refund.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            user: { select: { name: true, email: true } },
                        },
                    },
                    payment: { select: { provider: true } },
                },
            }),
            this.prisma.refund.count({ where }),
            this.prisma.refund.aggregate({
                where,
                _sum: { amount: true },
                _count: { _all: true },
            }),
        ]);

        return {
            data: refunds,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            summary: {
                totalRefunds: aggregate._count._all,
                totalAmount: Number(aggregate._sum.amount ?? 0),
            },
        };
    }

    async getLowStockReport() {
        const variants = await this.prisma.productVariant.findMany({
            where: {
                stockStatus: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        category: { select: { name: true } },
                        images: { where: { isPrimary: true }, take: 1 },
                    },
                },
            },
            orderBy: { stockQty: 'asc' },
        });

        return {
            total: variants.length,
            outOfStock: variants.filter((v) => v.stockStatus === 'OUT_OF_STOCK').length,
            lowStock: variants.filter((v) => v.stockStatus === 'LOW_STOCK').length,
            data: variants,
        };
    }

    async getCustomerReport(query: AdminQueryDto) {
        const { from, to, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            role: 'CUSTOMER',
            isActive: true,
            ...this.buildDateFilter(from, to),
        };

        const [customers, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    _count: { select: { orders: true, reviews: true } },
                    orders: { where: { paymentStatus: 'PAID' }, select: { total: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        const data = customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            createdAt: customer.createdAt,
            totalOrders: customer._count.orders,
            totalReviews: customer._count.reviews,
            lifetimeValue: customer.orders.reduce(
                (sum, order) => sum + Number(order.total), 0,
            ),
        }));

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private buildDateFilter(from?: string, to?: string) {
        if (!from && !to) return {};
        return {
            createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
            },
        };
    }
}