/*
  Warnings:

  - You are about to drop the `device_connections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "device_connections" DROP CONSTRAINT "device_connection_connection_id_foreign";

-- DropForeignKey
ALTER TABLE "device_connections" DROP CONSTRAINT "device_connection_device_id_foreign";

-- DropTable
DROP TABLE "device_connections";

-- CreateTable
CREATE TABLE "device_share" (
    "id" BIGSERIAL NOT NULL,
    "connection_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "can_ring" BOOLEAN NOT NULL DEFAULT false,
    "can_lock" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "device_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_share_unique" ON "device_share"("connection_id", "device_id");

-- AddForeignKey
ALTER TABLE "device_share" ADD CONSTRAINT "device_share_connection_id_foreign" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device_share" ADD CONSTRAINT "device_share_device_id_foreign" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
