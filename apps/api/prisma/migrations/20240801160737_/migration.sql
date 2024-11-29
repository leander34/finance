/*
  Warnings:

  - A unique constraint covering the columns `[stripe_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripe_customer_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionOrigin" AS ENUM ('PURCHASED', 'RESCUED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "status" TEXT NOT NULL,
    "stripe_discount_coupon_id" TEXT,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "stripeStartDate" DECIMAL(65,30) NOT NULL,
    "stripeCurrentPeriodStart" DECIMAL(65,30) NOT NULL,
    "stripeCurrentPeriodEnd" DECIMAL(65,30) NOT NULL,
    "stripeDaysUntilDue" DECIMAL(65,30),
    "stripeEndedAt" DECIMAL(65,30),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_stripePriceId_idx" ON "subscriptions"("stripePriceId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeProductId_idx" ON "subscriptions"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
