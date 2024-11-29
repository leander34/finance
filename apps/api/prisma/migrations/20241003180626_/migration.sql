/*
  Warnings:

  - You are about to drop the column `bank-id` on the `credit_cards` table. All the data in the column will be lost.
  - Added the required column `flag` to the `credit_cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CreditCardFlag" AS ENUM ('MCC', 'VCC', 'ECC', 'HCC', 'ACC', 'OUTROS');

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_bank-id_fkey";

-- AlterTable
ALTER TABLE "credit_cards" DROP COLUMN "bank-id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "flag" "CreditCardFlag" NOT NULL;
