/*
  Warnings:

  - A unique constraint covering the columns `[name,organization_id,type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_name_organization_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_organization_id_type_key" ON "categories"("name", "organization_id", "type");
