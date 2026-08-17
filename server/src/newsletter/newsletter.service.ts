import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

@Injectable()
export class NewsletterService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async subscribe(dto: SubscribeDto) {
        const existing = await this.prisma.newsletterSubscriber.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            // if previously unsubscribed re-subscribe
            if (!existing.isSubscribed) {
                await this.prisma.newsletterSubscriber.update({
                    where: { email: dto.email },
                    data: {
                        isSubscribed: true,
                        unsubscribedAt: null,
                        subscribedAt: new Date(),
                    },
                });
                return { message: 'Welcome back! You have been re-subscribed.' };
            }
            throw new ConflictException('This email is already subscribed');
        }

        await this.prisma.newsletterSubscriber.create({
            data: { email: dto.email },
        });

        return { message: 'Successfully subscribed to our newsletter!' };
    }

    async unsubscribe(dto: UnsubscribeDto) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { email: dto.email },
        });

        if (!subscriber || !subscriber.isSubscribed) {
            throw new NotFoundException('Email not found in subscribers list');
        }

        await this.prisma.newsletterSubscriber.update({
            where: { email: dto.email },
            data: {
                isSubscribed: false,
                unsubscribedAt: new Date(),
            },
        });

        return { message: 'You have been unsubscribed successfully' };
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAll(page = 1, limit = 20, isSubscribed?: boolean) {
        const skip = (page - 1) * limit;

        const where: any = {
            ...(isSubscribed !== undefined && { isSubscribed }),
        };

        const [subscribers, total] = await this.prisma.$transaction([
            this.prisma.newsletterSubscriber.findMany({
                where,
                skip,
                take: limit,
                orderBy: { subscribedAt: 'desc' },
            }),
            this.prisma.newsletterSubscriber.count({ where }),
        ]);

        return {
            data: subscribers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getStats() {
        const [total, active, unsubscribed] = await this.prisma.$transaction([
            this.prisma.newsletterSubscriber.count(),
            this.prisma.newsletterSubscriber.count({ where: { isSubscribed: true } }),
            this.prisma.newsletterSubscriber.count({ where: { isSubscribed: false } }),
        ]);

        return { total, active, unsubscribed };
    }

    async deleteSubscriber(id: number) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { id },
        });
        if (!subscriber) throw new NotFoundException('Subscriber not found');

        await this.prisma.newsletterSubscriber.delete({ where: { id } });
        return { message: 'Subscriber deleted successfully' };
    }
}