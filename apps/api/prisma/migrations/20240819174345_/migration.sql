/*
  Warnings:

  - You are about to drop the column `bankCompe` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankIspb` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `financial_accounts` table. All the data in the column will be lost.
  - Added the required column `bankId` to the `financial_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "financial_accounts" DROP COLUMN "bankCompe",
DROP COLUMN "bankIspb",
DROP COLUMN "bankName",
DROP COLUMN "image_url",
ADD COLUMN     "bankId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "main" BOOLEAN NOT NULL DEFAULT false,
    "compe" TEXT,
    "ispb" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
