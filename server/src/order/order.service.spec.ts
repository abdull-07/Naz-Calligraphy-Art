import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';

describe('OrderService.create', () => {
  it('allows guest checkout without a saved address', async () => {
    const prisma = {
      address: { findFirst: jest.fn() },
      productVariant: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10,
          productId: 12,
          label: 'Standard',
          price: 100,
          stockQty: 50,
          product: {
            id: 12,
            name: 'Calligraphy Set',
            status: 'ACTIVE',
            localShippingOnly: false,
          },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon: { findUnique: jest.fn(), update: jest.fn() },
      shippingZone: { findFirst: jest.fn().mockResolvedValue({ baseRate: 150 }) },
      order: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 1, orderNumber: 'NCA-2026-00001' }),
      },
      cart: { findUnique: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const service = new OrderService(prisma as any);

    await expect(
      service.create({
        items: [{ variantId: 10, quantity: 1 }],
        shippingType: 'DOMESTIC',
        paymentProvider: 'COD',
        guestInfo: {
          fullName: 'Guest User',
          email: 'guest@example.com',
          phone: '+923001234567',
          street: 'Main Street',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
      } as any),
    ).resolves.toMatchObject({ id: 1 });

    expect(prisma.address.findFirst).not.toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          addressId: null,
          addressSnapshot: expect.objectContaining({
            fullName: 'Guest User',
            country: 'Pakistan',
          }),
        }),
      }),
    );
  });
});
