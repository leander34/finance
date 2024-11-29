/*
  Warnings:

  - You are about to drop the column `ammount` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,name]` on the table `credit_cards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,name]` on the table `financial_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "ammount",
ADD COLUMN     "amount" MONEY NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "credit_cards_organization_id_name_key" ON "credit_cards"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_organization_id_name_key" ON "financial_accounts"("organization_id", "name");
