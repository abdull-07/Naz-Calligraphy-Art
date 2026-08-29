-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'COD';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "freeShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weightKg" DOUBLE PRECISION;
