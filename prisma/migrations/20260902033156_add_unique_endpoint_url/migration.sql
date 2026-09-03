/*
  Warnings:

  - A unique constraint covering the columns `[endpoint_url]` on the table `unified_push_providers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unified_push_providers_endpoint_url_key" ON "unified_push_providers"("endpoint_url");
