/*
  Warnings:

  - Added the required column `firstInstallmentDate` to the `installments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "firstInstallmentDate" TEXT NOT NULL;
