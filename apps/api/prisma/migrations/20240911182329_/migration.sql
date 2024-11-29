/*
  Warnings:

  - You are about to drop the column `disabled` on the `recurrences` table. All the data in the column will be lost.
  - Added the required column `amount` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realization_date` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frequency` on the `recurrences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('mensal', 'diario');

-- AlterTable
ALTER TABLE "recurrences" DROP COLUMN "disabled",
ADD COLUMN     "amount" MONEY NOT NULL,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "credit_card_id" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'BRL',
ADD COLUMN     "degree_of_need" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "financial_account_id" TEXT,
ADD COLUMN     "observation" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "realization_date" TEXT NOT NULL,
ADD COLUMN     "skip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subcategory_id" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "RecurrenceFrequency" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "futureTransaction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrence_id" TEXT,
ADD COLUMN     "subcategory_id" TEXT;

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "main_subcategory" BOOLEAN NOT NULL DEFAULT false,
    "type" "CategoryType" NOT NULL,
    "color" TEXT NOT NULL,
    "archived_at" TIMESTAMP(3),
    "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subcategories_name_idx" ON "subcategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_name_organization_id_key" ON "subcategories"("name", "organization_id");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
