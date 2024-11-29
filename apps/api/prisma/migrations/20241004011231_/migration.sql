/*
  Warnings:

  - Added the required column `credit_card_id` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodEnd` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "credit_cards_invoices" ADD COLUMN     "credit_card_id" TEXT NOT NULL,
ADD COLUMN     "periodEnd" TEXT NOT NULL,
ADD COLUMN     "periodStart" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "creditCardInvoice_id" TEXT;

-- AddForeignKey
ALTER TABLE "credit_cards_invoices" ADD CONSTRAINT "credit_cards_invoices_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creditCardInvoice_id_fkey" FOREIGN KEY ("creditCardInvoice_id") REFERENCES "credit_cards_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
