import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Optional,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // helper to extract sessionId from request header
    private getSessionId(req: Request): string {
        return req.headers['x-session-id'] as string;
    }

    // GET /api/v1/cart
    @Get()
    getCart(@Req() req: Request, @CurrentUser('id') userId?: number) {
        const sessionId = this.getSessionId(req);
        return this.cartService.getOrCreateCart(userId, sessionId);
    }

    // POST /api/v1/cart/items
    @Post('items')
    @HttpCode(HttpStatus.OK)
    addToCart(
        @Body() dto: AddToCartDto,
        @Req() req: Request,
        @CurrentUser('id') userId?: number,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.addToCart(dto, userId, sessionId);
    }

    // PATCH /api/v1/cart/items/:id
    @Patch('items/:id')
    updateCartItem(
        @Param('id', ParseIntPipe) itemId: number,
        @Body() dto: UpdateCartItemDto,
        @Req() req: Request,
        @CurrentUser('id') userId?: number,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.updateCartItem(itemId, dto, userId, sessionId);
    }

    // DELETE /api/v1/cart/items/:id
    @Delete('items/:id')
    @HttpCode(HttpStatus.OK)
    removeCartItem(
        @Param('id', ParseIntPipe) itemId: number,
        @Req() req: Request,
        @CurrentUser('id') userId?: number,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.removeCartItem(itemId, userId, sessionId);
    }

    // DELETE /api/v1/cart
    @Delete()
    @HttpCode(HttpStatus.OK)
    clearCart(
        @Req() req: Request,
        @CurrentUser('id') userId?: number,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.clearCart(userId, sessionId);
    }

    // POST /api/v1/cart/coupon
    @Post('coupon')
    @HttpCode(HttpStatus.OK)
    applyCoupon(
        @Body() dto: ApplyCouponDto,
        @Req() req: Request,
        @CurrentUser('id') userId?: number,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.applyCoupon(dto, userId, sessionId);
    }

    // POST /api/v1/cart/merge
    // called after login to merge guest cart
    @Post('merge')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    mergeCart(
        @CurrentUser('id') userId: number,
        @Req() req: Request,
    ) {
        const sessionId = this.getSessionId(req);
        return this.cartService.mergeGuestCart(sessionId, userId);
    }
}