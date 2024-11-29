/*
  Warnings:

  - You are about to drop the `bank_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_default_payment_account_id_fkey";

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "bank_accounts";

-- CreateTable
CREATE TABLE "financial_institutions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "initial_balance" MONEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountType" "BankAccountType" NOT NULL DEFAULT 'CC',
    "bank" TEXT,
    "bankCompe" TEXT,
    "bankIspb" TEXT,
    "color" TEXT NOT NULL,
    "visibledInOverallBalance" BOOLEAN NOT NULL,
    "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "financial_institutions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_default_payment_account_id_fkey" FOREIGN KEY ("default_payment_account_id") REFERENCES "financial_institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_institutions" ADD CONSTRAINT "financial_institutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_institutions" ADD CONSTRAINT "financial_institutions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
