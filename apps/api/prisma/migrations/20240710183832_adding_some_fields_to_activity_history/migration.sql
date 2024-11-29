/*
  Warnings:

  - You are about to drop the column `activityType` on the `activities_history` table. All the data in the column will be lost.
  - Added the required column `activity_type` to the `activities_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_type` to the `activities_history` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeciveType" AS ENUM ('mobile', 'desktop');

-- AlterTable
ALTER TABLE "activities_history" DROP COLUMN "activityType",
ADD COLUMN     "activity_type" "ActivityType" NOT NULL,
ADD COLUMN     "device_language" TEXT,
ADD COLUMN     "device_type" "DeciveType" NOT NULL;
