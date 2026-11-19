import { Module } from "@nestjs/common"
import { AccessService } from "./access.service.js"
import { PrismaModule } from "../../../prisma/prisma.module.js"

@Module({
  imports: [PrismaModule],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
