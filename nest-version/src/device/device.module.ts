import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { UserTierModule } from "../user-tier/user-tier.module.js"
import { DeviceController } from "./device.controller.js"
import { DeviceService } from "./device.service.js"

@Module({
  imports: [UserTierModule],
  controllers: [DeviceController],
  providers: [DeviceService, PrismaService],
  exports: [DeviceService],
})
export class DeviceModule {}
