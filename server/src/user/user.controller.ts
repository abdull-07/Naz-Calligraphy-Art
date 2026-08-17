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
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard) // all user routes require login
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─── PROFILE ─────────────────────────────────────────────────────────────

  // GET /api/v1/users/me
  @Get('me')
  getProfile(@CurrentUser('id') userId: number) {
    return this.userService.getProfile(userId);
  }

  // PATCH /api/v1/users/me
  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  // PATCH /api/v1/users/me/password
  @Patch('me/password')
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  // DELETE /api/v1/users/me
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@CurrentUser('id') userId: number) {
    return this.userService.deleteAccount(userId);
  }

  // ─── ADDRESSES ───────────────────────────────────────────────────────────

  // GET /api/v1/users/me/addresses
  @Get('me/addresses')
  getAddresses(@CurrentUser('id') userId: number) {
    return this.userService.getAddresses(userId);
  }

  // POST /api/v1/users/me/addresses
  @Post('me/addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return this.userService.createAddress(userId, dto);
  }

  // PATCH /api/v1/users/me/addresses/:id
  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(userId, addressId, dto);
  }

  // DELETE /api/v1/users/me/addresses/:id
  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.OK)
  deleteAddress(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.userService.deleteAddress(userId, addressId);
  }

  // PATCH /api/v1/users/me/addresses/:id/default
  @Patch('me/addresses/:id/default')
  setDefaultAddress(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.userService.setDefaultAddress(userId, addressId);
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────────

  // GET /api/v1/users/me/orders
  @Get('me/orders')
  getMyOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.getMyOrders(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // GET /api/v1/users/me/orders/:id
  @Get('me/orders/:id')
  getMyOrderById(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.userService.getMyOrderById(userId, orderId);
  }

  // ─── WISHLIST ─────────────────────────────────────────────────────────────

  // GET /api/v1/users/me/wishlist
  @Get('me/wishlist')
  getWishlist(@CurrentUser('id') userId: number) {
    return this.userService.getWishlist(userId);
  }

  // POST /api/v1/users/me/wishlist/:productId
  @Post('me/wishlist/:productId')
  @HttpCode(HttpStatus.CREATED)
  addToWishlist(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.userService.addToWishlist(userId, productId);
  }

  // DELETE /api/v1/users/me/wishlist/:productId
  @Delete('me/wishlist/:productId')
  @HttpCode(HttpStatus.OK)
  removeFromWishlist(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.userService.removeFromWishlist(userId, productId);
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  // GET /api/v1/users/me/notifications
  @Get('me/notifications')
  getNotifications(@CurrentUser('id') userId: number) {
    return this.userService.getNotifications(userId);
  }

  // PATCH /api/v1/users/me/notifications/:id/read
  @Patch('me/notifications/:id/read')
  markNotificationRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.userService.markNotificationRead(userId, notificationId);
  }

  // PATCH /api/v1/users/me/notifications/read-all
  @Patch('me/notifications/read-all')
  markAllNotificationsRead(@CurrentUser('id') userId: number) {
    return this.userService.markAllNotificationsRead(userId);
  }
}