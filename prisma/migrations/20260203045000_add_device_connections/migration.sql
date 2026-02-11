/*
  Warnings:

  - You are about to drop the `user_tier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_tier" DROP CONSTRAINT "user_tier_tier_id_foreign";

-- DropForeignKey
ALTER TABLE "user_tier" DROP CONSTRAINT "user_tier_user_id_foreign";

-- DropTable
DROP TABLE "user_tier";

-- CreateTable
CREATE TABLE "user_tiers" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "tier_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "user_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_connections" (
    "id" BIGSERIAL NOT NULL,
    "connection_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "can_ring" BOOLEAN NOT NULL DEFAULT false,
    "can_lock" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "device_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_connection_unique" ON "device_connections"("connection_id", "device_id");

-- AddForeignKey
ALTER TABLE "user_tiers" ADD CONSTRAINT "user_tier_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_tiers" ADD CONSTRAINT "user_tier_tier_id_foreign" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device_connections" ADD CONSTRAINT "device_connection_connection_id_foreign" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device_connections" ADD CONSTRAINT "device_connection_device_id_foreign" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
