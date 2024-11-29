/*
  Warnings:

  - You are about to drop the column `lastDate` on the `recurrences` table. All the data in the column will be lost.
  - Added the required column `lastProcessingDate` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastRealizationDate` to the `recurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `recurrences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recurrences" DROP COLUMN "lastDate",
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "lastProcessingDate" TEXT NOT NULL,
ADD COLUMN     "lastRealizationDate" TEXT NOT NULL,
ADD COLUMN     "startDate" TEXT NOT NULL;
