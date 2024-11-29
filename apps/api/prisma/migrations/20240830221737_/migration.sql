/*
  Warnings:

  - A unique constraint covering the columns `[name,organization_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organization_id]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_name_organization_id_key" ON "categories"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_organization_id_key" ON "tags"("name", "organization_id");
