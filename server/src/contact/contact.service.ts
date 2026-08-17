import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    async create(dto: CreateContactDto) {
        await this.prisma.contactMessage.create({
            data: {
                name: dto.name,
                email: dto.email,
                subject: dto.subject,
                message: dto.message,
            },
        });

        // TODO: send notification email to admin via EmailService

        return {
            message: 'Your message has been sent. We will get back to you within 24 hours.',
        };
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    async findAll(
        page = 1,
        limit = 20,
        isRead?: boolean,
        search?: string,
    ) {
        const skip = (page - 1) * limit;

        const where: any = {
            ...(isRead !== undefined && { isRead }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [messages, total] = await this.prisma.$transaction([
            this.prisma.contactMessage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contactMessage.count({ where }),
        ]);

        return {
            data: messages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const message = await this.prisma.contactMessage.findUnique({
            where: { id },
        });
        if (!message) throw new NotFoundException('Message not found');

        // mark as read when admin opens it
        if (!message.isRead) {
            await this.prisma.contactMessage.update({
                where: { id },
                data: { isRead: true },
            });
        }

        return message;
    }

    async markAsRead(id: number) {
        const message = await this.prisma.contactMessage.findUnique({
            where: { id },
        });
        if (!message) throw new NotFoundException('Message not found');

        return this.prisma.contactMessage.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAsReplied(id: number) {
        const message = await this.prisma.contactMessage.findUnique({
            where: { id },
        });
        if (!message) throw new NotFoundException('Message not found');

        return this.prisma.contactMessage.update({
            where: { id },
            data: {
                isRead: true,
                repliedAt: new Date(),
            },
        });
    }

    async remove(id: number) {
        const message = await this.prisma.contactMessage.findUnique({
            where: { id },
        });
        if (!message) throw new NotFoundException('Message not found');

        await this.prisma.contactMessage.delete({ where: { id } });
        return { message: 'Message deleted successfully' };
    }

    async getStats() {
        const [total, unread, replied] = await this.prisma.$transaction([
            this.prisma.contactMessage.count(),
            this.prisma.contactMessage.count({ where: { isRead: false } }),
            this.prisma.contactMessage.count({
                where: { repliedAt: { not: null } },
            }),
        ]);

        return { total, unread, replied, pending: total - replied };
    }
}
