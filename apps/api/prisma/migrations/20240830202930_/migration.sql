/*
  Warnings:

  - The values [INCOME] on the enum `CategoryType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `type` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('REVENUE', 'EXPENSE');

-- AlterEnum
BEGIN;
CREATE TYPE "CategoryType_new" AS ENUM ('REVENUE', 'EXPENSE');
ALTER TABLE "categories" ALTER COLUMN "type" TYPE "CategoryType_new" USING ("type"::text::"CategoryType_new");
ALTER TYPE "CategoryType" RENAME TO "CategoryType_old";
ALTER TYPE "CategoryType_new" RENAME TO "CategoryType";
DROP TYPE "CategoryType_old";
COMMIT;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "type" "TagType" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "description" SET NOT NULL;
