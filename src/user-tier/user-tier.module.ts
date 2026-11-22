import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { UserTierController } from "./user-tier.controller.js"
import { UserTierService } from "./user-tier.service.js"

@Module({
  imports: [PrismaModule],
  controllers: [UserTierController],
  providers: [UserTierService],
  exports: [UserTierService],
})
export class UserTierModule {}
