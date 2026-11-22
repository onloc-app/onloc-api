import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { ApiKeyController } from "./api-key.controller.js"
import { ApiKeyService } from "./api-key.service.js"

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
