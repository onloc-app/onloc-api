/*
  Warnings:

  - You are about to drop the `device_share` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "device_share" DROP CONSTRAINT "device_share_connection_id_foreign";

-- DropForeignKey
ALTER TABLE "device_share" DROP CONSTRAINT "device_share_device_id_foreign";

-- DropForeignKey
ALTER TABLE "device_share" DROP CONSTRAINT "device_share_user_id_foreign";

-- DropTable
DROP TABLE "device_share";

-- CreateTable
CREATE TABLE "device_shares" (
    "id" BIGSERIAL NOT NULL,
    "connection_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "can_ring" BOOLEAN NOT NULL DEFAULT false,
    "can_lock" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "device_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_avatars" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "user_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_share_unique" ON "device_shares"("connection_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_avatars_user_id_key" ON "user_avatars"("user_id");

-- AddForeignKey
ALTER TABLE "device_shares" ADD CONSTRAINT "device_share_connection_id_foreign" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device_shares" ADD CONSTRAINT "device_share_device_id_foreign" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device_shares" ADD CONSTRAINT "device_share_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
