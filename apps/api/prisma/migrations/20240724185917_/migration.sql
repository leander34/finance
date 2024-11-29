-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PERSONAL');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "type" "OrganizationType" NOT NULL DEFAULT 'PERSONAL';
