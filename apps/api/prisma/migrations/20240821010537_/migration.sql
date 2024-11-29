/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceClosingDate` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceDueDate` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCategory` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankId` on the `financial_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `degreeOfNeed` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `invoice_closing_date` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_due_date` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank-id` to the `financial_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree-of_need` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "financial_accounts" DROP CONSTRAINT "financial_accounts_bankId_fkey";

-- DropIndex
DROP INDEX "categories_name_defaultCategory_key";

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "archivedAt",
DROP COLUMN "invoiceClosingDate",
DROP COLUMN "invoiceDueDate",
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "invoice_closing_date" INTEGER NOT NULL,
ADD COLUMN     "invoice_due_date" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "defaultCategory",
DROP COLUMN "isArchived",
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "main_category" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "financial_accounts" DROP COLUMN "accountType",
DROP COLUMN "archivedAt",
DROP COLUMN "bankId",
ADD COLUMN     "account_type" "BankAccountType" NOT NULL DEFAULT 'CC',
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "bank-id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "degreeOfNeed",
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "degree-of_need" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "archived_at" TIMESTAMP(3),
    "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_tags" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transaction_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_bank-id_fkey" FOREIGN KEY ("bank-id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
