-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CC', 'CP', 'CI');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstLoginToday" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultCategory" BOOLEAN NOT NULL DEFAULT false,
    "type" "CategoryType" NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "limit" DECIMAL(65,30) NOT NULL,
    "invoiceClosingDate" INTEGER NOT NULL,
    "invoiceDueDate" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_invoices" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "credit_card_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountType" "BankAccountType" NOT NULL DEFAULT 'CC',
    "bank" TEXT,
    "bankCompe" TEXT,
    "bankIspb" TEXT,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "ammount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" TEXT NOT NULL,
    "degreeOfNeed" INTEGER,
    "skip" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrences" (
    "id" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "nextDate" TEXT NOT NULL,
    "lastDate" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_defaultCategory_key" ON "categories"("name", "defaultCategory");
