/*
  Warnings:

  - You are about to drop the `credit_card_invoices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "credit_card_invoices";

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);
