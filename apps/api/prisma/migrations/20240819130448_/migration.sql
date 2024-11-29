/*
  Warnings:

  - The values [INCOME,ADJUSTMENT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `financial_institutions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organization_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_at` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realization_date` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedAt` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('REVENUE', 'EXPENSE', 'TRANSFER', 'POSITIVE_ADJUSTMENT', 'NEGATIVE_ADJUSTMENT');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_default_payment_account_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_institutions" DROP CONSTRAINT "financial_institutions_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_institutions" DROP CONSTRAINT "financial_institutions_user_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "description",
ADD COLUMN     "credit_card_id" TEXT,
ADD COLUMN     "financial_account_id" TEXT,
ADD COLUMN     "observation" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "paid_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "realization_date" TEXT NOT NULL,
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "financial_institutions";

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "initial_balance" MONEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountType" "BankAccountType" NOT NULL DEFAULT 'CC',
    "image_url" TEXT NOT NULL,
    "financialAccountName" TEXT NOT NULL,
    "bankCompe" TEXT,
    "bankIspb" TEXT,
    "color" TEXT NOT NULL,
    "visibledInOverallBalance" BOOLEAN NOT NULL DEFAULT true,
    "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_default_payment_account_id_fkey" FOREIGN KEY ("default_payment_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
