import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── CREATE ORDER ─────────────────────────────────────────────────────────

    async create(dto: CreateOrderDto, userId?: number) {
        // 1. validate address
        const address = await this.prisma.address.findFirst({
            where: {
                id: dto.addressId,
                ...(userId && { userId }),
            },
        });
        if (!address) throw new NotFoundException('Address not found');

        // 2. validate all variants and calculate prices
        const orderItems = await Promise.all(
            dto.items.map(async (item) => {
                const variant = await this.prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true },
                });

                if (!variant) {
                    throw new NotFoundException(`Variant #${item.variantId} not found`);
                }
                if (variant.product.status !== 'ACTIVE') {
                    throw new BadRequestException(
                        `Product "${variant.product.name}" is not available`,
                    );
                }
                if (variant.stockQty < item.quantity) {
                    throw new BadRequestException(
                        `Only ${variant.stockQty} units available for "${variant.product.name} - ${variant.label}"`,
                    );
                }
                if (variant.product.localShippingOnly && dto.shippingType === 'INTERNATIONAL') {
                    throw new BadRequestException(
                        `"${variant.product.name}" is only available for local shipping`,
                    );
                }

                return {
                    variantId: variant.id,
                    productId: variant.productId,
                    productName: variant.product.name,
                    variantLabel: variant.label,
                    unitPrice: Number(variant.price),
                    quantity: item.quantity,
                    subtotal: Number(variant.price) * item.quantity,
                };
            }),
        );

        // 3. calculate subtotal
        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        // 4. calculate shipping fee
        const shippingFee = await this.calculateShippingFee(
            dto.shippingType ?? 'DOMESTIC',
        );

        // 5. apply coupon if provided
        let discount = 0;
        let couponDiscount = 0;

        if (dto.couponCode) {
            const coupon = await this.prisma.coupon.findUnique({
                where: { code: dto.couponCode.toUpperCase() },
            });

            if (!coupon || !coupon.isActive) {
                throw new BadRequestException('Invalid coupon code');
            }

            const now = new Date();
            if (coupon.expiresAt && coupon.expiresAt < now) {
                throw new BadRequestException('Coupon has expired');
            }
            if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) {
                throw new BadRequestException('Coupon usage limit reached');
            }
            if (coupon.minOrderAmt && subtotal < Number(coupon.minOrderAmt)) {
                throw new BadRequestException(
                    `Minimum order of Rs. ${coupon.minOrderAmt} required`,
                );
            }

            if (coupon.type === 'PERCENTAGE') {
                couponDiscount = (subtotal * Number(coupon.value)) / 100;
                if (coupon.maxDiscount) {
                    couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount));
                }
            } else if (coupon.type === 'FIXED') {
                couponDiscount = Number(coupon.value);
            } else if (coupon.type === 'FREE_SHIPPING') {
                discount = shippingFee;
            }

            discount += couponDiscount;

            // increment coupon usage
            await this.prisma.coupon.update({
                where: { id: coupon.id },
                data: { usesCount: { increment: 1 } },
            });
        }

        // 6. calculate total
        const total = Math.max(0, subtotal + shippingFee - discount);

        // 7. generate order number
        const orderNumber = await this.generateOrderNumber();

        // 8. create address snapshot
        const addressSnapshot = {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            country: address.country,
        };

        // 9. create order in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // create order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    addressId: address.id,
                    addressSnapshot,
                    shippingType: dto.shippingType ?? 'DOMESTIC',
                    subtotal,
                    shippingFee,
                    discount,
                    couponCode: dto.couponCode?.toUpperCase(),
                    couponDiscount,
                    total,
                    customerNote: dto.customerNote,
                    items: {
                        create: orderItems,
                    },
                    statusHistory: {
                        create: {
                            status: 'PENDING',
                            note: 'Order placed successfully',
                        },
                    },
                    payment: {
                        create: {
                            provider: dto.paymentProvider,
                            amount: total,
                            currency: 'PKR',
                            status: 'UNPAID',
                        },
                    },
                },
                include: {
                    items: true,
                    payment: true,
                    statusHistory: true,
                },
            });

            // deduct stock for each variant
            for (const item of dto.items) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stockQty: { decrement: item.quantity } },
                });
            }

            return newOrder;
        });

        // 10. clear user cart after order placed
        if (userId) {
            const cart = await this.prisma.cart.findUnique({ where: { userId } });
            if (cart) {
                await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
        }

        return order;
    }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async findMyOrders(userId: number, query: OrderQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            userId,
            ...(status && { status }),
        };

        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        select: {
                            id: true,
                            productName: true,
                            variantLabel: true,
                            unitPrice: true,
                            quantity: true,
                            subtotal: true,
                            productImage: true,
                        },
                    },
                    payment: {
                        select: { provider: true, status: true, paidAt: true },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findMyOrderById(userId: number, orderId: number) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                payment: true,
                refund: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAllAdmin(query: OrderQueryDto) {
        const { status, search, from, to, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(search && {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ],
            }),
            ...(from || to
                ? {
                    createdAt: {
                        ...(from && { gte: new Date(from) }),
                        ...(to && { lte: new Date(to) }),
                    },
                }
                : {}),
        };

        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    items: { select: { productName: true, quantity: true, subtotal: true } },
                    payment: { select: { provider: true, status: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findAdminOrderById(orderId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: true,
                payment: true,
                refund: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!order) throw new NotFoundException(`Order #${orderId} not found`);
        return order;
    }

    async updateStatus(
        orderId: number,
        dto: UpdateOrderStatusDto,
        adminId: number,
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) throw new NotFoundException(`Order #${orderId} not found`);

        // validate status transition
        this.validateStatusTransition(order.status, dto.status);

        const updateData: any = { status: dto.status };

        if (dto.trackingNumber) updateData.trackingNumber = dto.trackingNumber;
        if (dto.courierName) updateData.courierName = dto.courierName;
        if (dto.status === 'SHIPPED') updateData.shippedAt = new Date();
        if (dto.status === 'DELIVERED') updateData.deliveredAt = new Date();

        const [updated] = await this.prisma.$transaction([
            this.prisma.order.update({
                where: { id: orderId },
                data: updateData,
                include: { items: true, payment: true, statusHistory: true },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: dto.status,
                    note: dto.note,
                    changedBy: adminId,
                },
            }),
        ]);

        return updated;
    }

    async cancelOrder(orderId: number, userId: number) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: true },
        });

        if (!order) throw new NotFoundException('Order not found');

        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new BadRequestException(
                'Only pending or confirmed orders can be cancelled',
            );
        }

        // restore stock
        await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                if (item.variantId) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stockQty: { increment: item.quantity } },
                    });
                }
            }

            await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'CANCELLED',
                    note: 'Cancelled by customer',
                },
            });
        });

        return { message: 'Order cancelled successfully' };
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private async generateOrderNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.prisma.order.count();
        const padded = String(count + 1).padStart(5, '0');
        return `NCA-${year}-${padded}`;
    }

    private async calculateShippingFee(shippingType: string): Promise<number> {
        const zone = await this.prisma.shippingZone.findFirst({
            where: {
                isActive: true,
                countries: shippingType === 'DOMESTIC'
                    ? { has: 'PK' }
                    : { isEmpty: false },
            },
        });

        return zone ? Number(zone.baseRate) : 150; // default Rs. 150
    }

    private validateStatusTransition(current: string, next: string) {
        const allowed: Record<string, string[]> = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: ['REFUNDED'],
            CANCELLED: [],
            REFUNDED: [],
        };

        if (!allowed[current]?.includes(next)) {
            throw new BadRequestException(
                `Cannot transition order from ${current} to ${next}`,
            );
        }
    }
}