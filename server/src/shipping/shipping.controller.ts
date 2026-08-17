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
    Query,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma';

@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // POST /api/v1/shipping/calculate
    @Post('calculate')
    @HttpCode(HttpStatus.OK)
    calculateRate(@Body() dto: CalculateShippingDto) {
        return this.shippingService.calculateRate(dto);
    }

    // GET /api/v1/shipping/zones/active
    @Get('zones/active')
    getActiveZones() {
        return this.shippingService.getActiveZones();
    }

    // GET /api/v1/shipping/zones/country/:country
    @Get('zones/country/:country')
    getZoneByCountry(@Param('country') country: string) {
        return this.shippingService.getZoneByCountry(country.toUpperCase());
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/shipping/zones
    @Get('zones')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAll() {
        return this.shippingService.findAll();
    }

    // GET /api/v1/shipping/zones/:id
    @Get('zones/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.shippingService.findOne(id);
    }

    // POST /api/v1/shipping/zones
    @Post('zones')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateShippingZoneDto) {
        return this.shippingService.create(dto);
    }

    // PATCH /api/v1/shipping/zones/:id
    @Patch('zones/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateShippingZoneDto,
    ) {
        return this.shippingService.update(id, dto);
    }

    // DELETE /api/v1/shipping/zones/:id
    @Delete('zones/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.shippingService.remove(id);
    }

    // PATCH /api/v1/shipping/zones/:id/toggle
    @Patch('zones/:id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.shippingService.toggleActive(id);
    }

    // POST /api/v1/shipping/zones/seed
    @Post('zones/seed')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    seedDefaultZones() {
        return this.shippingService.seedDefaultZones();
    }
}