/*
  Warnings:

  - A unique constraint covering the columns `[name,organization_id,type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organization_id,type]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_name_organization_id_type_key" ON "categories"("name", "organization_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_name_organization_id_type_key" ON "subcategories"("name", "organization_id", "type");
