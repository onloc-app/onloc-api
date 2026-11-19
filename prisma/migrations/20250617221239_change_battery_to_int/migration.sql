/*
  Warnings:

  - You are about to alter the column `battery` on the `locations` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Made the column `created_at` on table `devices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `devices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "locations" ALTER COLUMN "battery" SET DATA TYPE INTEGER,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
