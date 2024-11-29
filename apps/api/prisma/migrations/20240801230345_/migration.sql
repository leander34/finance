/*
  Warnings:

  - Added the required column `resolved_plan` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionResolvedPlan" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "resolved_plan" "SubscriptionResolvedPlan" NOT NULL;
