-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "bearing" DOUBLE PRECISION,
ADD COLUMN     "bearing_accuracy_degrees" DOUBLE PRECISION,
ADD COLUMN     "speed" DOUBLE PRECISION;
