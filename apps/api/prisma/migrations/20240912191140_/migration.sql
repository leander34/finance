/*
  Warnings:

  - You are about to drop the column `integration_type` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "financial_accounts" ADD COLUMN     "integration_type" "IntegrationAccountType" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "integration_type";
