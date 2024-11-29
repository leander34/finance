/*
  Warnings:

  - You are about to drop the column `device_language` on the `activities_history` table. All the data in the column will be lost.
  - You are about to drop the column `device_type` on the `activities_history` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[device_id]` on the table `activities_history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `device_id` to the `activities_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities_history" DROP COLUMN "device_language",
DROP COLUMN "device_type",
ADD COLUMN     "device_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "raw_user_agency" TEXT NOT NULL,
    "user_agency" TEXT,
    "language" TEXT,
    "mobile" TEXT,
    "phone" TEXT,
    "tablet" TEXT,
    "os" TEXT,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_history_device_id_key" ON "activities_history"("device_id");

-- AddForeignKey
ALTER TABLE "activities_history" ADD CONSTRAINT "activities_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
