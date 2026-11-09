/*
  Warnings:

  - A unique constraint covering the columns `[order_rank]` on the table `tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tiers" ADD COLUMN     "order_rank" SERIAL;

-- CreateIndex
CREATE UNIQUE INDEX "tiers_order_rank_key" ON "tiers"("order_rank");
