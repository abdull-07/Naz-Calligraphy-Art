import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── PROFILE ─────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        provider: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    // if email is being changed check it is not taken
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Email already in use');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Cannot change password for OAuth accounts');
    }

    // verify current password
    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!match) throw new BadRequestException('Current password is incorrect');

    // hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        refreshToken: null, // invalidate all sessions
      },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: number) {
    // soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        refreshToken: null,
      },
    });

    return { message: 'Account deleted successfully' };
  }

  // ─── ADDRESSES ───────────────────────────────────────────────────────────

  async getAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // default address first
        { createdAt: 'desc' },
      ],
    });
  }

  async createAddress(userId: number, dto: CreateAddressDto) {
    // if setting as default unset all other defaults first
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // if this is the first address make it default automatically
    const count = await this.prisma.address.count({ where: { userId } });
    const isDefault = dto.isDefault ?? count === 0;

    return this.prisma.address.create({
      data: {
        ...dto,
        isDefault,
        userId,
      },
    });
  }

  async updateAddress(userId: number, addressId: number, dto: UpdateAddressDto) {
    await this.findAddressById(userId, addressId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: number, addressId: number) {
    await this.findAddressById(userId, addressId);

    await this.prisma.address.delete({ where: { id: addressId } });

    // if deleted address was default set next one as default
    const remaining = await this.prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (remaining) {
      await this.prisma.address.update({
        where: { id: remaining.id },
        data: { isDefault: true },
      });
    }

    return { message: 'Address deleted successfully' };
  }

  async setDefaultAddress(userId: number, addressId: number) {
    await this.findAddressById(userId, addressId);

    // unset all defaults
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // set new default
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  // ─── ORDERS HISTORY ──────────────────────────────────────────────────────

  async getMyOrders(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              variantLabel: true,
              unitPrice: true,
              quantity: true,
              subtotal: true,
              productImage: true,
            },
          },
          payment: {
            select: {
              provider: true,
              status: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyOrderById(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        refund: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── WISHLIST ─────────────────────────────────────────────────────────────

  async getWishlist(userId: number) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            variants: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWishlist(userId: number, productId: number) {
    // check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // check already in wishlist
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('Product already in wishlist');

    return this.prisma.wishlist.create({
      data: { userId, productId },
    });
  }

  async removeFromWishlist(userId: number, productId: number) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) throw new NotFoundException('Product not in wishlist');

    await this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { message: 'Removed from wishlist' };
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markNotificationRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

  private async findAddressById(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }
}