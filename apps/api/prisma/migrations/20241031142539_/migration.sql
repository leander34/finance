/*
  Warnings:

  - Added the required column `day` to the `recurrences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN     "day" INTEGER NOT NULL;
