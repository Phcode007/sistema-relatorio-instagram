-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT 'temporary_value_to_be_updated';

-- Remove default after migration
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
