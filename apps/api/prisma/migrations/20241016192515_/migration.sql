/*
  Warnings:

  - Added the required column `due_date` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentAmount` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installment_number` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realization_date` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_number_of_installments` to the `installments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "due_date" TEXT NOT NULL,
ADD COLUMN     "installmentAmount" MONEY NOT NULL,
ADD COLUMN     "installment_number" INTEGER NOT NULL,
ADD COLUMN     "realization_date" TEXT NOT NULL,
ADD COLUMN     "status" "TransactionStatus" NOT NULL,
ADD COLUMN     "total_number_of_installments" INTEGER NOT NULL,
ADD COLUMN     "transaction_id" TEXT;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
