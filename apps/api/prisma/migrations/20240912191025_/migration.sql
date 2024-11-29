-- CreateEnum
CREATE TYPE "IntegrationAccountType" AS ENUM ('MANUAL', 'OPEN_FINANCE');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "integration_type" "IntegrationAccountType" NOT NULL DEFAULT 'MANUAL';
