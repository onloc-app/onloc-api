import { Module } from "@nestjs/common"
import { TierController } from "./tier.controller.js"
import { TierService } from "./tier.service.js"
import { PrismaModule } from "../prisma/prisma.module.js"

@Module({
  imports: [PrismaModule],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule {}
