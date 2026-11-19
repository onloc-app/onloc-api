-- CreateTable
CREATE TABLE "unified_push_providers" (
    "id" BIGSERIAL NOT NULL,
    "device_id" BIGINT NOT NULL,
    "endpoint_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "unified_push_providers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unified_push_providers" ADD CONSTRAINT "unified_push_providers_device_id_foreign" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
