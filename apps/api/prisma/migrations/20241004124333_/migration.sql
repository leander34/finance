/*
  Warnings:

  - Added the required column `dueDate` to the `credit_cards_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credit_cards_invoices" ADD COLUMN     "dueDate" TEXT NOT NULL;
