/*
  Warnings:

  - Changed the type of `email_verified_at` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verified_at",
ADD COLUMN     "email_verified_at" TIMESTAMP(3) NOT NULL;
