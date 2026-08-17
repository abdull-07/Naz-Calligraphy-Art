import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // POST /api/v1/newsletter/subscribe
    @Post('subscribe')
    @HttpCode(HttpStatus.OK)
    subscribe(@Body() dto: SubscribeDto) {
        return this.newsletterService.subscribe(dto);
    }

    // POST /api/v1/newsletter/unsubscribe
    @Post('unsubscribe')
    @HttpCode(HttpStatus.OK)
    unsubscribe(@Body() dto: UnsubscribeDto) {
        return this.newsletterService.unsubscribe(dto);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/newsletter/subscribers
    @Get('subscribers')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('active') active?: string,
    ) {
        const isSubscribed =
            active === 'true' ? true : active === 'false' ? false : undefined;

        return this.newsletterService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            isSubscribed,
        );
    }

    // GET /api/v1/newsletter/stats
    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    getStats() {
        return this.newsletterService.getStats();
    }

    // DELETE /api/v1/newsletter/subscribers/:id
    @Delete('subscribers/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    deleteSubscriber(@Param('id', ParseIntPipe) id: number) {
        return this.newsletterService.deleteSubscriber(id);
    }
}