-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_recurrence_id_fkey";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
