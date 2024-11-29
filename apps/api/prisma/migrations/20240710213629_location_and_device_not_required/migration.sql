-- DropForeignKey
ALTER TABLE "activities_history" DROP CONSTRAINT "activities_history_device_id_fkey";

-- AlterTable
ALTER TABLE "activities_history" ALTER COLUMN "location_id" DROP NOT NULL,
ALTER COLUMN "device_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "activities_history" ADD CONSTRAINT "activities_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
