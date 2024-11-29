-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_credit_card_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_credit_card_invoice_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_installment_id_fkey";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_invoice_id_fkey" FOREIGN KEY ("credit_card_invoice_id") REFERENCES "credit_cards_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_invoice_payment_id_fkey" FOREIGN KEY ("credit_card_invoice_payment_id") REFERENCES "credit_cards_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
