/*
  Warnings:

  - Added the required column `bank-id` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "bank-id" TEXT NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "friend_contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "friend_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_transaction" (
    "id" TEXT NOT NULL,
    "friend_contact_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "value" MONEY NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "friend_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_bank-id_fkey" FOREIGN KEY ("bank-id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_transaction" ADD CONSTRAINT "friend_transaction_friend_contact_id_fkey" FOREIGN KEY ("friend_contact_id") REFERENCES "friend_contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_transaction" ADD CONSTRAINT "friend_transaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
