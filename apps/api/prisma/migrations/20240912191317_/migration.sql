/*
  Warnings:

  - The `integration_type` column on the `financial_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AccountIntegrationType" AS ENUM ('MANUAL', 'OPEN_FINANCE');

-- AlterTable
ALTER TABLE "financial_accounts" DROP COLUMN "integration_type",
ADD COLUMN     "integration_type" "AccountIntegrationType" NOT NULL DEFAULT 'MANUAL';

-- DropEnum
DROP TYPE "IntegrationAccountType";
