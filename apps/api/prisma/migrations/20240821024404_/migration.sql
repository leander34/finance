/*
  Warnings:

  - You are about to drop the column `degree-of_need` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "degree-of_need",
ADD COLUMN     "degree_of_need" INTEGER;
