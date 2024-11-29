-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN     "destination_financial_account_id" TEXT;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_destination_financial_account_id_fkey" FOREIGN KEY ("destination_financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
