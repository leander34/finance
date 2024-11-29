/*
  Warnings:

  - Added the required column `cancel_at_period_end` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_at" DECIMAL(65,30),
ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL,
ADD COLUMN     "canceled_at" DECIMAL(65,30);
