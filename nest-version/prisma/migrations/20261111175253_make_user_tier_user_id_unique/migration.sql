/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_user_id_unique" ON "user_tiers"("user_id");
