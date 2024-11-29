-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RecurrenceFrequency" ADD VALUE 'anual';
ALTER TYPE "RecurrenceFrequency" ADD VALUE 'semestral';
ALTER TYPE "RecurrenceFrequency" ADD VALUE 'trimestral';
ALTER TYPE "RecurrenceFrequency" ADD VALUE 'bimestral';
ALTER TYPE "RecurrenceFrequency" ADD VALUE 'quinzenal';
ALTER TYPE "RecurrenceFrequency" ADD VALUE 'semanal';
