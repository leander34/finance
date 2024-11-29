-- AlterTable
ALTER TABLE "transaction_tags" ADD COLUMN     "recurrence_id" TEXT;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
