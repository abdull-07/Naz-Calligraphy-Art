import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/create-payment-intent.dto';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';
import { RefundDto } from './dto/refund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    // ─── CUSTOMER ─────────────────────────────────────────────────────────────

    // POST /api/v1/payments/initiate
    @Post('initiate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    initiatePayment(
        @Body() dto: InitiatePaymentDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.paymentService.initiatePayment(
            dto.orderId,
            dto.provider,
            userId,
        );
    }

    // GET /api/v1/payments/status/:orderId
    @Get('status/:orderId')
    @UseGuards(JwtAuthGuard)
    getPaymentStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
        @CurrentUser('id') userId: number,
    ) {
        return this.paymentService.getPaymentStatus(orderId, userId);
    }

    // ─── JAZZCASH CALLBACK ────────────────────────────────────────────────────

    // POST /api/v1/payments/jazzcash/callback
    @Post('jazzcash/callback')
    @HttpCode(HttpStatus.OK)
    jazzCashCallback(@Body() payload: any) {
        return this.paymentService.handleJazzCashCallback(payload);
    }

    // ─── EASYPAISA CALLBACK ───────────────────────────────────────────────────

    // POST /api/v1/payments/easypaisa/callback
    @Post('easypaisa/callback')
    @HttpCode(HttpStatus.OK)
    easyPaisaCallback(@Body() payload: any) {
        return this.paymentService.handleEasyPaisaCallback(payload);
    }

    // ─── HBL CALLBACK ────────────────────────────────────────────────────────

    // POST /api/v1/payments/hbl/callback
    @Post('hbl/callback')
    @HttpCode(HttpStatus.OK)
    hblCallback(@Body() payload: any) {
        return this.paymentService.handleHBLCallback(payload);
    }

    // ─── STRIPE (STUBBED) ────────────────────────────────────────────────────
    // TODO: Uncomment when ready to activate Stripe
    // @Post('stripe/webhook')
    // @HttpCode(HttpStatus.OK)
    // stripeWebhook(
    //   @Req() req: any,
    //   @Headers('stripe-signature') signature: string,
    // ) {
    //   return this.paymentService.handleStripeWebhook(req.rawBody, signature);
    // }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // POST /api/v1/payments/cod/confirm/:orderId
    @Post('cod/confirm/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.OK)
    confirmCOD(
        @Param('orderId', ParseIntPipe) orderId: number,
        @CurrentUser('id') adminId: number,
    ) {
        return this.paymentService.confirmCOD(orderId, adminId);
    }

    // POST /api/v1/payments/bank-transfer/confirm
    @Post('bank-transfer/confirm')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.OK)
    confirmBankTransfer(
        @Body() dto: ConfirmBankTransferDto,
        @CurrentUser('id') adminId: number,
    ) {
        return this.paymentService.confirmBankTransfer(
            dto.orderId,
            dto.referenceNumber ?? '',
            dto.note ?? '',
            adminId,
        );
    }

    // POST /api/v1/payments/refund/:orderId
    @Post('refund/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    refundOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() dto: RefundDto,
        @CurrentUser('id') adminId: number,
    ) {
        return this.paymentService.refundOrder(orderId, dto.reason, adminId);
    }
}