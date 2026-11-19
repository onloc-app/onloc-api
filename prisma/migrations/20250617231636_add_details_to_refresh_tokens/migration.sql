/*
  Warnings:

  - Added the required column `created_at` to the `refreshTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `refreshTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refreshTokens" ADD COLUMN     "agent" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(0) NOT NULL;
