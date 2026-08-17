import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // POST /api/v1/contact
    @Post()
    @HttpCode(HttpStatus.OK)
    create(@Body() dto: CreateContactDto) {
        return this.contactService.create(dto);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/contact
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('isRead') isRead?: string,
        @Query('search') search?: string,
    ) {
        const readFilter =
            isRead === 'true' ? true : isRead === 'false' ? false : undefined;

        return this.contactService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            readFilter,
            search,
        );
    }

    // GET /api/v1/contact/stats
    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    getStats() {
        return this.contactService.getStats();
    }

    // GET /api/v1/contact/:id
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.contactService.findOne(id);
    }

    // PATCH /api/v1/contact/:id/read
    @Patch(':id/read')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    markAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.contactService.markAsRead(id);
    }

    // PATCH /api/v1/contact/:id/replied
    @Patch(':id/replied')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    markAsReplied(@Param('id', ParseIntPipe) id: number) {
        return this.contactService.markAsReplied(id);
    }

    // DELETE /api/v1/contact/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.contactService.remove(id);
    }
}