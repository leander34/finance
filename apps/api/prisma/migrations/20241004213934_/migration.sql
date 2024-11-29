/*
  Warnings:

  - You are about to drop the column `creditCardInvoice_id` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_creditCardInvoice_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "creditCardInvoice_id",
ADD COLUMN     "credit_card_invoice_id" TEXT,
ADD COLUMN     "credit_card_invoice_payment_id" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_invoice_id_fkey" FOREIGN KEY ("credit_card_invoice_id") REFERENCES "credit_cards_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_invoice_payment_id_fkey" FOREIGN KEY ("credit_card_invoice_payment_id") REFERENCES "credit_cards_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
