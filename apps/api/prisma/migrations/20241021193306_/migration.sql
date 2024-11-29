/*
  Warnings:

  - Changed the type of `month` on the `credit_cards_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `credit_cards_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "credit_cards_invoices" DROP COLUMN "month",
ADD COLUMN     "month" INTEGER NOT NULL,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;
