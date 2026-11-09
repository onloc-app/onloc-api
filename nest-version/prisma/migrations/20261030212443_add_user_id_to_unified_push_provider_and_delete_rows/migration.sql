/*
  Warnings:

  - Added the required column `user_id` to the `unified_push_providers` table without a default value. This is not possible if the table is not empty.

*/
-- Empty table
DELETE FROM "unified_push_providers";

-- AlterTable
ALTER TABLE "unified_push_providers" ADD COLUMN     "user_id" BIGINT NOT NULL,
ALTER COLUMN "device_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "unified_push_providers" ADD CONSTRAINT "unified_push_providers_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
