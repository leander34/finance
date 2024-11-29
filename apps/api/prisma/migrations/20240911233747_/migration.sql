/*
  Warnings:

  - You are about to drop the column `url` on the `banks` table. All the data in the column will be lost.
  - Added the required column `image_url` to the `banks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banks" DROP COLUMN "url",
ADD COLUMN     "image_url" TEXT NOT NULL;
