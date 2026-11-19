import { Module } from "@nestjs/common"
import { AccessService } from "./access.service.js"
import { PrismaService } from "../../../prisma/prisma.service.js"

@Module({
  providers: [AccessService, PrismaService],
  exports: [AccessService],
})
export class AccessModule {}
