import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { UserTierController } from "./user-tier.controller.js"
import { UserTierService } from "./user-tier.service.js"

@Module({
  controllers: [UserTierController],
  providers: [UserTierService, PrismaService],
  exports: [UserTierService],
})
export class UserTierModule {}
