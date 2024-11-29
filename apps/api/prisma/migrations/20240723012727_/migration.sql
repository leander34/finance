/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
