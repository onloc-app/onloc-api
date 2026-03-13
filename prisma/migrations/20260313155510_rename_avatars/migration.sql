/*
  Warnings:

  - You are about to drop the `user_avatars` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_avatars" DROP CONSTRAINT "user_avatars_user_id_foreign";

-- DropTable
DROP TABLE "user_avatars";

-- CreateTable
CREATE TABLE "avatars" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatars_user_id_key" ON "avatars"("user_id");

-- AddForeignKey
ALTER TABLE "avatars" ADD CONSTRAINT "user_avatars_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
