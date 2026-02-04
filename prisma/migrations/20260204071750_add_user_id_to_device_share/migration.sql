/*
  Warnings:

  - Added the required column `user_id` to the `device_share` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device_share" ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "device_share" ADD CONSTRAINT "device_share_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
