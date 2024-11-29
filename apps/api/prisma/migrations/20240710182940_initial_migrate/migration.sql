-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SIGN_IN', 'SIGN_UP', 'VERIFY_EMAIL', 'RESEND_VERIFICATION_EMAIL', 'PASSWORD_RESET', 'FORGOT_PASSWORD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "password" TEXT,
    "avatar_url" TEXT,
    "email_verified_at" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "activities_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postal" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "org" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_document_key" ON "users"("document");

-- CreateIndex
CREATE UNIQUE INDEX "activities_history_location_id_key" ON "activities_history"("location_id");

-- AddForeignKey
ALTER TABLE "activities_history" ADD CONSTRAINT "activities_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities_history" ADD CONSTRAINT "activities_history_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
