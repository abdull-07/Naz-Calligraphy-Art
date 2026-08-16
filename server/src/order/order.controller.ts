import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // ─── CUSTOMER ─────────────────────────────────────────────────────────────

    // POST /api/v1/orders
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() dto: CreateOrderDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.orderService.create(dto, userId);
    }

    // GET /api/v1/orders/my
    @Get('my')
    @UseGuards(JwtAuthGuard)
    findMyOrders(
        @CurrentUser('id') userId: number,
        @Query() query: OrderQueryDto,
    ) {
        return this.orderService.findMyOrders(userId, query);
    }

    // GET /api/v1/orders/my/:id
    @Get('my/:id')
    @UseGuards(JwtAuthGuard)
    findMyOrderById(
        @CurrentUser('id') userId: number,
        @Param('id', ParseIntPipe) orderId: number,
    ) {
        return this.orderService.findMyOrderById(userId, orderId);
    }

    // PATCH /api/v1/orders/my/:id/cancel
    @Patch('my/:id/cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    cancelOrder(
        @CurrentUser('id') userId: number,
        @Param('id', ParseIntPipe) orderId: number,
    ) {
        return this.orderService.cancelOrder(orderId, userId);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/orders
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    findAllAdmin(@Query() query: OrderQueryDto) {
        return this.orderService.findAllAdmin(query);
    }

    // GET /api/v1/orders/:id
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER, Role.SUPPORT)
    findAdminOrderById(@Param('id', ParseIntPipe) orderId: number) {
        return this.orderService.findAdminOrderById(orderId);
    }

    // PATCH /api/v1/orders/:id/status
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    updateStatus(
        @Param('id', ParseIntPipe) orderId: number,
        @Body() dto: UpdateOrderStatusDto,
        @CurrentUser('id') adminId: number,
    ) {
        return this.orderService.updateStatus(orderId, dto, adminId);
    }
}