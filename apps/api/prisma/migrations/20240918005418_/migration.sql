-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_default_payment_account_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_user_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_accounts" DROP CONSTRAINT "financial_accounts_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_accounts" DROP CONSTRAINT "financial_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_user_id_fkey";

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_default_payment_account_id_fkey" FOREIGN KEY ("default_payment_account_id") REFERENCES "financial_accounts"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
