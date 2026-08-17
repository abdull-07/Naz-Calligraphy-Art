import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── GET OR CREATE CART ───────────────────────────────────────────────────

    async getOrCreateCart(userId?: number, sessionId?: string) {
        if (userId) {
            // logged-in user cart
            let cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
            });

            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: { userId },
                    include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
                });
            }

            return this.formatCart(cart);
        }

        if (sessionId) {
            // guest cart
            let cart = await this.prisma.cart.findUnique({
                where: { sessionId },
                include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
            });

            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: {
                        sessionId,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                    include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
                });
            }

            return this.formatCart(cart);
        }

        throw new BadRequestException('userId or sessionId required');
    }

    // ─── ADD TO CART ─────────────────────────────────────────────────────────

    async addToCart(dto: AddToCartDto, userId?: number, sessionId?: string) {
        // verify variant exists and has stock
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: dto.variantId },
            include: { product: true },
        });

        if (!variant) throw new NotFoundException('Product variant not found');
        if (variant.product.status !== 'ACTIVE') {
            throw new BadRequestException('Product is not available');
        }
        if (variant.stockQty < dto.quantity) {
            throw new BadRequestException(
                `Only ${variant.stockQty} items available in stock`,
            );
        }

        // get or create cart
        const cart = await this.findOrCreateRawCart(userId, sessionId);

        // check if variant already in cart
        const existing = await this.prisma.cartItem.findUnique({
            where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } },
        });

        if (existing) {
            // update quantity
            const newQty = existing.quantity + dto.quantity;

            if (newQty > variant.stockQty) {
                throw new BadRequestException(
                    `Cannot add more. Only ${variant.stockQty} items available`,
                );
            }

            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: newQty },
            });
        } else {
            // add new item
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId: dto.variantId,
                    quantity: dto.quantity,
                },
            });
        }

        return this.getOrCreateCart(userId, sessionId);
    }

    // ─── UPDATE CART ITEM ─────────────────────────────────────────────────────

    async updateCartItem(
        itemId: number,
        dto: UpdateCartItemDto,
        userId?: number,
        sessionId?: string,
    ) {
        const cart = await this.findOrCreateRawCart(userId, sessionId);

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
            include: { variant: true },
        });

        if (!item) throw new NotFoundException('Cart item not found');

        if (dto.quantity > item.variant.stockQty) {
            throw new BadRequestException(
                `Only ${item.variant.stockQty} items available in stock`,
            );
        }

        await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
        });

        return this.getOrCreateCart(userId, sessionId);
    }

    // ─── REMOVE CART ITEM ─────────────────────────────────────────────────────

    async removeCartItem(
        itemId: number,
        userId?: number,
        sessionId?: string,
    ) {
        const cart = await this.findOrCreateRawCart(userId, sessionId);

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });

        if (!item) throw new NotFoundException('Cart item not found');

        await this.prisma.cartItem.delete({ where: { id: itemId } });

        return this.getOrCreateCart(userId, sessionId);
    }

    // ─── CLEAR CART ───────────────────────────────────────────────────────────

    async clearCart(userId?: number, sessionId?: string) {
        const cart = await this.findOrCreateRawCart(userId, sessionId);

        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return { message: 'Cart cleared successfully' };
    }

    // ─── APPLY COUPON ─────────────────────────────────────────────────────────

    async applyCoupon(
        dto: ApplyCouponDto,
        userId?: number,
        sessionId?: string,
    ) {
        const cart = await this.getOrCreateCart(userId, sessionId);

        // find coupon
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: dto.code.toUpperCase() },
        });

        if (!coupon || !coupon.isActive) {
            throw new BadRequestException('Invalid or expired coupon code');
        }

        // check date range
        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now) {
            throw new BadRequestException('Coupon is not yet active');
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
            throw new BadRequestException('Coupon has expired');
        }

        // check usage limit
        if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) {
            throw new BadRequestException('Coupon usage limit reached');
        }

        // check minimum order amount
        if (coupon.minOrderAmt && cart.subtotal < Number(coupon.minOrderAmt)) {
            throw new BadRequestException(
                `Minimum order amount of Rs. ${coupon.minOrderAmt} required`,
            );
        }

        // calculate discount
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (cart.subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, Number(coupon.maxDiscount));
            }
        } else if (coupon.type === 'FIXED') {
            discount = Number(coupon.value);
        }

        return {
            ...cart,
            couponCode: coupon.code,
            couponType: coupon.type,
            couponDiscount: discount,
            freeShipping: coupon.type === 'FREE_SHIPPING',
            total: Math.max(0, cart.subtotal - discount),
        };
    }

    // ─── MERGE GUEST CART ─────────────────────────────────────────────────────

    // called after login to merge guest cart into user cart
    async mergeGuestCart(sessionId: string, userId: number) {
        const guestCart = await this.prisma.cart.findUnique({
            where: { sessionId },
            include: { items: true },
        });

        if (!guestCart || guestCart.items.length === 0) return;

        const userCart = await this.findOrCreateRawCart(userId);

        for (const item of guestCart.items) {
            const existing = await this.prisma.cartItem.findUnique({
                where: {
                    cartId_variantId: { cartId: userCart.id, variantId: item.variantId },
                },
            });

            if (existing) {
                await this.prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity },
                });
            } else {
                await this.prisma.cartItem.create({
                    data: {
                        cartId: userCart.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    },
                });
            }
        }

        // delete guest cart after merge
        await this.prisma.cart.delete({ where: { id: guestCart.id } });
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private async findOrCreateRawCart(userId?: number, sessionId?: string) {
        if (userId) {
            let cart = await this.prisma.cart.findUnique({ where: { userId } });
            if (!cart) {
                cart = await this.prisma.cart.create({ data: { userId } });
            }
            return cart;
        }

        if (sessionId) {
            let cart = await this.prisma.cart.findUnique({ where: { sessionId } });
            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: {
                        sessionId,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });
            }
            return cart;
        }

        throw new BadRequestException('userId or sessionId required');
    }

    private formatCart(cart: any) {
        const items = cart.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            variant: {
                id: item.variant.id,
                label: item.variant.label,
                price: item.variant.price,
                comparePrice: item.variant.comparePrice,
                stockQty: item.variant.stockQty,
                stockStatus: item.variant.stockStatus,
            },
            product: {
                id: item.variant.product.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                localShippingOnly: item.variant.product.localShippingOnly,
                image: item.variant.product.images?.[0]?.url ?? null,
            },
            itemTotal: Number(item.variant.price) * item.quantity,
        }));

        const subtotal = items.reduce((sum: number, i: any) => sum + i.itemTotal, 0);
        const itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

        return {
            id: cart.id,
            itemCount,
            subtotal,
            items,
        };
    }
}