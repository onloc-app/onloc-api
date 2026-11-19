import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { ApiKeyController } from "./api-key.controller.js"
import { ApiKeyService } from "./api-key.service.js"

@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, PrismaService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
