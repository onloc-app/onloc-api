import { Module } from "@nestjs/common"
import { TierController } from "./tier.controller.js"
import { TierService } from "./tier.service.js"
import { PrismaService } from "../prisma/prisma.service.js"

@Module({
  controllers: [TierController],
  providers: [TierService, PrismaService],
  exports: [TierService],
})
export class TierModule {}
