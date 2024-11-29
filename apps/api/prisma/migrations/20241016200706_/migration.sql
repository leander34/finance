/*
  Warnings:

  - You are about to drop the column `due_date` on the `installments` table. All the data in the column will be lost.
  - You are about to drop the column `installmentAmount` on the `installments` table. All the data in the column will be lost.
  - You are about to drop the column `installment_number` on the `installments` table. All the data in the column will be lost.
  - You are about to drop the column `realization_date` on the `installments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `installments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `installments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "installments" DROP CONSTRAINT "installments_transaction_id_fkey";

-- AlterTable
ALTER TABLE "installments" DROP COLUMN "due_date",
DROP COLUMN "installmentAmount",
DROP COLUMN "installment_number",
DROP COLUMN "realization_date",
DROP COLUMN "status",
DROP COLUMN "transaction_id";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "installment_id" TEXT,
ADD COLUMN     "installment_number" INTEGER;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
