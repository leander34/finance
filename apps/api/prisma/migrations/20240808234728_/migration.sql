/*
  Warnings:

  - Added the required column `initial_balance` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visibledInOverallBalance` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_payment_account_id` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `limit` on the `cards` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ammount` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "initial_balance" MONEY NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "visibledInOverallBalance" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "blocked_by_expired_subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "default_payment_account_id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "limit",
ADD COLUMN     "limit" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "ammount",
ADD COLUMN     "ammount" MONEY NOT NULL;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_default_payment_account_id_fkey" FOREIGN KEY ("default_payment_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
