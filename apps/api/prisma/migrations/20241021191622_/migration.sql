/*
  Warnings:

  - Added the required column `month` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credit_cards_invoices" ADD COLUMN     "month" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL;
