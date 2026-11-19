/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tiers_key_unique" ON "tiers"("name");
