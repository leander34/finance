/*
  Warnings:

  - You are about to drop the column `stripeCurrentPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodStart` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeDaysUntilDue` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeEndedAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeStartDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `current_period_end` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_period_start` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripe_price_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripe_product_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripe_subscription_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "subscriptions_stripePriceId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeProductId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCurrentPeriodStart",
DROP COLUMN "stripeDaysUntilDue",
DROP COLUMN "stripeEndedAt",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeProductId",
DROP COLUMN "stripeStartDate",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "current_period_end" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "current_period_start" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "ended_at" DECIMAL(65,30),
ADD COLUMN     "start_date" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "stripe_days_until_due" DECIMAL(65,30),
ADD COLUMN     "stripe_price_id" TEXT NOT NULL,
ADD COLUMN     "stripe_product_id" TEXT NOT NULL,
ADD COLUMN     "stripe_subscription_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_price_id_idx" ON "subscriptions"("stripe_price_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_product_id_idx" ON "subscriptions"("stripe_product_id");
