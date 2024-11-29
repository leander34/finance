/*
  Warnings:

  - You are about to drop the column `financialAccountName` on the `financial_accounts` table. All the data in the column will be lost.
  - Added the required column `bankName` to the `financial_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "financial_accounts" DROP COLUMN "financialAccountName",
ADD COLUMN     "bankName" TEXT NOT NULL;
