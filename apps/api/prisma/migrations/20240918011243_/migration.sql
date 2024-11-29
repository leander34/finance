/*
  Warnings:

  - A unique constraint covering the columns `[name,organization_id,type]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "subcategories_name_organization_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_name_organization_id_type_key" ON "subcategories"("name", "organization_id", "type");
