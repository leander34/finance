/*
  Warnings:

  - Added the required column `organization_id` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `installments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "credit_card_id" TEXT,
ADD COLUMN     "financial_account_id" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
