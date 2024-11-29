/*
  Warnings:

  - You are about to drop the column `receivedAt` on the `transactions` table. All the data in the column will be lost.
  - Changed the type of `status` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `degreeOfNeed` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "receivedAt",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'BRL',
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL,
ALTER COLUMN "degreeOfNeed" SET NOT NULL;
