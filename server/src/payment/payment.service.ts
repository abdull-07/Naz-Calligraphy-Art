import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '../generated/prisma';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    // ─── INITIATE PAYMENT ─────────────────────────────────────────────────────

    async initiatePayment(orderId: number, provider: string, userId: number) {
        const order = await this.findOrderForPayment(orderId, userId);

        switch (provider) {
            case 'JAZZCASH':
                return this.initiateJazzCash(order);
            case 'EASYPAISA':
                return this.initiateEasyPaisa(order);
            case 'HBL':
                return this.initiateHBL(order);
            case 'COD':
                return this.initiateCOD(order);
            case 'BANK_TRANSFER':
                return this.initiateBankTransfer(order);
            case 'STRIPE':
                return this.stripeStub();
            default:
                throw new BadRequestException(`Unsupported payment provider: ${provider}`);
        }
    }

    // ─── JAZZCASH ─────────────────────────────────────────────────────────────

    private async initiateJazzCash(order: any) {
        const merchantId = this.config.get('JAZZCASH_MERCHANT_ID');
        const password = this.config.get('JAZZCASH_PASSWORD');
        const integritySalt = this.config.get('JAZZCASH_INTEGRITY_SALT');
        const returnUrl = this.config.get('JAZZCASH_RETURN_URL');

        const txnRefNo = `JC-${order.orderNumber}-${Date.now()}`;
        const txnAmount = Math.round(Number(order.total) * 100).toString();
        const txnCurrency = 'PKR';
        const txnDateTime = this.getDateTime();
        const txnExpiryDateTime = this.getExpiryDateTime(30);
        const billReference = `ORDER-${order.id}`;
        const description = `Naz Calligraphy ${order.orderNumber}`;

        // generate HMAC-SHA256 hash
        const hashString = [
            integritySalt,
            '',           // BillReference (empty in hash)
            '',           // Description (empty in hash)
            merchantId,
            password,
            txnAmount,
            txnCurrency,
            txnDateTime,
            txnExpiryDateTime,
            '',           // MobileAccountNo (empty for web)
            txnRefNo,
        ].join('&');

        const secureHash = crypto
            .createHmac('sha256', integritySalt)
            .update(hashString)
            .digest('hex')
            .toUpperCase();

        // save provider reference
        await this.updatePaymentRef(order.id, txnRefNo, 'JAZZCASH');

        return {
            provider: 'JAZZCASH',
            method: 'POST_REDIRECT',
            actionUrl: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
            // change to production URL when live:
            // actionUrl: 'https://jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
            fields: {
                pp_Version: '1.1',
                pp_TxnType: 'MWALLET',
                pp_Language: 'EN',
                pp_MerchantID: merchantId,
                pp_Password: password,
                pp_TxnRefNo: txnRefNo,
                pp_Amount: txnAmount,
                pp_TxnCurrency: txnCurrency,
                pp_TxnDateTime: txnDateTime,
                pp_BillReference: billReference,
                pp_Description: description,
                pp_TxnExpiryDateTime: txnExpiryDateTime,
                pp_ReturnURL: returnUrl,
                pp_SecureHash: secureHash,
            },
        };
    }

    async handleJazzCashCallback(payload: any) {
        const {
            pp_TxnRefNo,
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_Amount,
            pp_SecureHash,
        } = payload;

        // verify hash
        const integritySalt = this.config.get('JAZZCASH_INTEGRITY_SALT');
        const isValid = this.verifyJazzCashHash(payload, integritySalt);
        if (!isValid) throw new BadRequestException('Invalid JazzCash hash');

        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: pp_TxnRefNo },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        const success = pp_ResponseCode === '000';
        await this.updatePaymentStatus(payment, success, payload);

        return {
            success,
            message: pp_ResponseMessage,
            orderId: payment.orderId,
        };
    }

    private verifyJazzCashHash(payload: any, salt: string): boolean {
        const {
            pp_SecureHash,
            pp_Amount,
            pp_TxnCurrency,
            pp_TxnDateTime,
            pp_TxnExpiryDateTime,
            pp_TxnRefNo,
            pp_MerchantID,
        } = payload;

        const hashString = [
            salt,
            pp_Amount,
            pp_TxnCurrency,
            pp_TxnDateTime,
            pp_TxnExpiryDateTime,
            pp_MerchantID,
            '',
            pp_TxnRefNo,
        ].join('&');

        const computed = crypto
            .createHmac('sha256', salt)
            .update(hashString)
            .digest('hex')
            .toUpperCase();

        return computed === pp_SecureHash;
    }

    // ─── EASYPAISA ────────────────────────────────────────────────────────────

    private async initiateEasyPaisa(order: any) {
        const storeId = this.config.get('EASYPAISA_STORE_ID');
        const hashKey = this.config.get('EASYPAISA_HASH_KEY');
        const returnUrl = this.config.get('EASYPAISA_RETURN_URL');

        const orderId = `EP-${order.orderNumber}-${Date.now()}`;
        const amount = Number(order.total).toFixed(2);
        const expiryDate = this.getExpiryDateTime(30);
        const storeName = 'Naz Calligraphy Art';
        const description = `Order ${order.orderNumber}`;
        const postBackUrl = `${this.config.get('API_URL')}/api/v1/payments/easypaisa/callback`;

        // generate SHA-256 hash
        const hashString = `${amount}${expiryDate}${orderId}${postBackUrl}${storeId}${storeId}${returnUrl}`;
        const hash = crypto
            .createHash('sha256')
            .update(hashKey + hashString)
            .digest('hex');

        // save provider reference
        await this.updatePaymentRef(order.id, orderId, 'EASYPAISA');

        return {
            provider: 'EASYPAISA',
            method: 'POST_REDIRECT',
            actionUrl: 'https://easypaisa.com.pk/easypay/Index.jsf',
            // change to production URL when live:
            // actionUrl: 'https://easypaisa.com.pk/easypay/Index.jsf',
            fields: {
                storeId,
                amount,
                postBackURL: postBackUrl,
                orderRefNum: orderId,
                expiryDate,
                autoRedirect: '0',
                storeType: 'SS',
                storeName: storeId,
                emailAddr: '',
                merchantHashedReq: hash,
                description,
            },
        };
    }

    async handleEasyPaisaCallback(payload: any) {
        const {
            orderRefNum,
            paymentMethod,
            responseCode,
            responseDesc,
            transactionDateTime,
            transactionId,
            storeId,
        } = payload;

        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: orderRefNum },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        const success = responseCode === '0000';
        await this.updatePaymentStatus(payment, success, payload);

        return {
            success,
            message: responseDesc,
            transactionId,
            orderId: payment.orderId,
        };
    }

    // ─── HBL PAYCONNECT ───────────────────────────────────────────────────────

    private async initiateHBL(order: any) {
        const merchantId = this.config.get('HBL_MERCHANT_ID');
        const password = this.config.get('HBL_MERCHANT_PASSWORD');
        const salt = this.config.get('HBL_INTEGRITY_SALT');
        const returnUrl = this.config.get('HBL_RETURN_URL');
        const apiUrl = this.config.get('HBL_API_URL');

        const txnRefNo = `HBL-${order.orderNumber}-${Date.now()}`;
        const amount = Number(order.total).toFixed(2);
        const currency = 'PKR';
        const txnDateTime = this.getDateTime();
        const expiryDate = this.getExpiryDateTime(60);
        const description = `Naz Calligraphy ${order.orderNumber}`;

        // generate HMAC-SHA256 hash
        // NOTE: Update hash fields based on actual HBL documentation
        // received after merchant approval
        const hashString = [
            salt,
            merchantId,
            txnRefNo,
            amount,
            currency,
            txnDateTime,
            expiryDate,
        ].join('&');

        const secureHash = crypto
            .createHmac('sha256', salt)
            .update(hashString)
            .digest('hex')
            .toUpperCase();

        // save provider reference
        await this.updatePaymentRef(order.id, txnRefNo, 'HBL');

        return {
            provider: 'HBL',
            method: 'POST_REDIRECT',
            // TODO: Update actionUrl with actual HBL PayConnect URL
            // from documentation received after merchant approval
            actionUrl: `${apiUrl}/payment/initiate`,
            fields: {
                merchantId,
                password,
                txnRefNo,
                amount,
                currency,
                txnDateTime,
                expiryDate,
                description,
                returnUrl,
                secureHash,
                // TODO: Add any additional fields required
                // by HBL PayConnect documentation
            },
        };
    }

    async handleHBLCallback(payload: any) {
        const {
            txnRefNo,
            responseCode,
            responseMessage,
            amount,
            transactionId,
        } = payload;

        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: txnRefNo },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        // TODO: Verify HBL hash signature using salt
        // from documentation received after merchant approval
        // const isValid = this.verifyHBLHash(payload, salt);
        // if (!isValid) throw new BadRequestException('Invalid HBL hash');

        // NOTE: Update success response code based on
        // actual HBL PayConnect documentation
        const success = responseCode === '00';
        await this.updatePaymentStatus(payment, success, payload);

        return {
            success,
            message: responseMessage,
            transactionId,
            orderId: payment.orderId,
        };
    }

    // ─── COD ──────────────────────────────────────────────────────────────────

    private async initiateCOD(order: any) {
        await this.updatePaymentRef(order.id, `COD-${order.orderNumber}`, 'COD');

        return {
            provider: 'COD',
            method: 'NONE',
            message: 'Order placed successfully. Pay cash on delivery.',
            orderNumber: order.orderNumber,
            amount: order.total,
        };
    }

    async confirmCOD(orderId: number, adminId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.payment?.provider !== 'COD') {
            throw new BadRequestException('Order is not a COD order');
        }
        if (order.paymentStatus === 'PAID') {
            throw new BadRequestException('Payment already confirmed');
        }

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { orderId },
                data: { status: 'PAID', paidAt: new Date() },
            }),
            this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'PAID' },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    note: 'COD payment collected and confirmed',
                    changedBy: adminId,
                },
            }),
        ]);

        return { message: 'COD payment confirmed successfully' };
    }

    // ─── BANK TRANSFER ────────────────────────────────────────────────────────

    private async initiateBankTransfer(order: any) {
        await this.updatePaymentRef(
            order.id,
            `BT-${order.orderNumber}`,
            'BANK_TRANSFER',
        );

        return {
            provider: 'BANK_TRANSFER',
            method: 'MANUAL',
            message: 'Please transfer the amount to the bank account below.',
            amount: order.total,
            orderNumber: order.orderNumber,
            bankDetails: {
                bankName: 'Meezan Bank',           // update with your bank
                accountTitle: 'Naz Calligraphy Art',
                accountNumber: '0000000000000000',      // update with your account
                iban: 'PK00MEZN0000000000000', // update with your IBAN
                branchCode: '0000',                  // update with your branch
                reference: order.orderNumber,       // customer uses this as reference
            },
            instructions: [
                'Transfer the exact amount shown above',
                `Use order number ${order.orderNumber} as payment reference`,
                'Send payment screenshot to WhatsApp: +92-XXX-XXXXXXX',
                'Your order will be confirmed within 24 hours',
            ],
        };
    }

    async confirmBankTransfer(
        orderId: number,
        referenceNumber: string,
        note: string,
        adminId: number,
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.payment?.provider !== PaymentProvider.BANK_TRANSFER) {
            throw new BadRequestException('Order is not a bank transfer order');
        }
        if (order.paymentStatus === 'PAID') {
            throw new BadRequestException('Payment already confirmed');
        }

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { orderId },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    providerRef: referenceNumber,
                    rawResponse: { referenceNumber, note, confirmedBy: adminId } as any,
                },
            }),
            this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID',
                },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'CONFIRMED',
                    note: `Bank transfer confirmed. Ref: ${referenceNumber}. ${note ?? ''}`,
                    changedBy: adminId,
                },
            }),
        ]);

        return { message: 'Bank transfer payment confirmed successfully' };
    }

    // ─── STRIPE STUB ──────────────────────────────────────────────────────────

    // TODO: Uncomment and implement when ready to activate Stripe
    // Steps to activate:
    // 1. npm install stripe
    // 2. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env
    // 3. Uncomment Stripe code below
    // 4. Enable rawBody: true in main.ts
    // 5. Add stripe webhook endpoint in Stripe dashboard

    private stripeStub() {
        throw new BadRequestException(
            'Stripe payments are not yet activated. Please use JazzCash, EasyPaisa, HBL, Bank Transfer, or COD.',
        );
    }

    // async createStripePaymentIntent(order: any) {
    //   const stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
    //     apiVersion: '2024-06-20',
    //   });
    //   const amountInPaisa = Math.round(Number(order.total) * 100);
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: amountInPaisa,
    //     currency: 'pkr',
    //     metadata: { orderId: order.id, orderNumber: order.orderNumber },
    //   });
    //   await this.updatePaymentRef(order.id, paymentIntent.id, 'STRIPE');
    //   return {
    //     provider: 'STRIPE',
    //     clientSecret: paymentIntent.client_secret,
    //     paymentIntentId: paymentIntent.id,
    //     amount: order.total,
    //     currency: 'PKR',
    //   };
    // }

    // async handleStripeWebhook(payload: Buffer, signature: string) {
    //   const stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
    //     apiVersion: '2024-06-20',
    //   });
    //   let event: Stripe.Event;
    //   try {
    //     event = stripe.webhooks.constructEvent(
    //       payload,
    //       signature,
    //       this.config.get('STRIPE_WEBHOOK_SECRET'),
    //     );
    //   } catch {
    //     throw new BadRequestException('Invalid Stripe webhook signature');
    //   }
    //   if (event.type === 'payment_intent.succeeded') {
    //     const pi = event.data.object as Stripe.PaymentIntent;
    //     const payment = await this.prisma.payment.findFirst({
    //       where: { providerRef: pi.id },
    //     });
    //     if (payment) await this.updatePaymentStatus(payment, true, pi);
    //   }
    //   return { received: true };
    // }

    // ─── REFUND ───────────────────────────────────────────────────────────────

    async refundOrder(orderId: number, reason: string, adminId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true, refund: true },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (!order.payment) throw new BadRequestException('No payment record found');
        if (order.paymentStatus !== 'PAID') {
            throw new BadRequestException('Order has not been paid');
        }
        if (order.refund) {
            throw new BadRequestException('Refund already issued for this order');
        }

        // NOTE: For JazzCash, EasyPaisa, and HBL refunds are
        // processed manually through merchant portal
        // Stripe refunds can be automated once Stripe is activated

        await this.prisma.$transaction([
            this.prisma.refund.create({
                data: {
                    orderId,
                    paymentId: order.payment.id,
                    amount: order.total,
                    reason,
                    providerRef: null, // manual refund — no provider ref
                },
            }),
            this.prisma.payment.update({
                where: { orderId },
                data: { status: 'REFUNDED' },
            }),
            this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'REFUNDED',
                    paymentStatus: 'REFUNDED',
                },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'REFUNDED',
                    note: `Refund issued. Reason: ${reason}`,
                    changedBy: adminId,
                },
            }),
        ]);

        return {
            message: 'Refund recorded. Process manually via payment provider portal.',
            provider: order.payment.provider,
            amount: order.total,
            orderId,
        };
    }

    // ─── PAYMENT STATUS ───────────────────────────────────────────────────────

    async getPaymentStatus(orderId: number, userId: number) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                payment: {
                    select: {
                        provider: true,
                        status: true,
                        amount: true,
                        currency: true,
                        paidAt: true,
                    },
                },
            },
        });

        if (!order) throw new NotFoundException('Order not found');

        return {
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            payment: order.payment,
        };
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private async findOrderForPayment(orderId: number, userId: number) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                payment: true,
                refund: true,
            },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.paymentStatus === 'PAID') {
            throw new BadRequestException('Order is already paid');
        }

        return order;
    }

    private async updatePaymentRef(
        orderId: number,
        ref: string,
        provider: string,
    ) {
        await this.prisma.payment.update({
            where: { orderId },
            data: { providerRef: ref },
        });
    }

    private async updatePaymentStatus(
        payment: any,
        success: boolean,
        rawResponse: any,
    ) {
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: success ? 'PAID' : 'FAILED',
                    paidAt: success ? new Date() : null,
                    rawResponse: rawResponse,
                },
            }),
            this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: success ? 'CONFIRMED' : 'PENDING',
                    paymentStatus: success ? 'PAID' : 'UNPAID',
                },
            }),
            ...(success
                ? [
                    this.prisma.orderStatusHistory.create({
                        data: {
                            orderId: payment.orderId,
                            status: 'CONFIRMED',
                            note: `Payment confirmed via ${payment.provider}`,
                        },
                    }),
                ]
                : []),
        ]);
    }

    private getDateTime(): string {
        return new Date()
            .toISOString()
            .replace(/[-:T.Z]/g, '')
            .slice(0, 14);
    }

    private getExpiryDateTime(minutes: number): string {
        return new Date(Date.now() + minutes * 60 * 1000)
            .toISOString()
            .replace(/[-:T.Z]/g, '')
            .slice(0, 14);
    }
}