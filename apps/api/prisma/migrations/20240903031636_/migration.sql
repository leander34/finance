/*
  Warnings:

  - You are about to drop the `cards` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bank-id` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_payment_account_id` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_closing_date` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_due_date` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limit` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `credit_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `credit_cards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_bank-id_fkey";

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_default_payment_account_id_fkey";

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_credit_card_id_fkey";

-- AlterTable
ALTER TABLE "credit_cards" ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "bank-id" TEXT NOT NULL,
ADD COLUMN     "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "default_payment_account_id" TEXT NOT NULL,
ADD COLUMN     "invoice_closing_date" INTEGER NOT NULL,
ADD COLUMN     "invoice_due_date" INTEGER NOT NULL,
ADD COLUMN     "limit" MONEY NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "cards";

-- CreateTable
CREATE TABLE "credit_cards_invoices" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "credit_cards_invoices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_default_payment_account_id_fkey" FOREIGN KEY ("default_payment_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_bank-id_fkey" FOREIGN KEY ("bank-id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
