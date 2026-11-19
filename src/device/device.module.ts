import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { QueueModule } from "../common/modules/queue/queue.module.js"
import { RealtimeModule } from "../realtime/realtime.module.js"
import { UserTierModule } from "../user-tier/user-tier.module.js"
import { AccessModule } from "../common/modules/access/access.module.js"
import { DeviceController } from "./device.controller.js"
import { DeviceService } from "./device.service.js"

@Module({
  imports: [UserTierModule, QueueModule, RealtimeModule, AccessModule],
  controllers: [DeviceController],
  providers: [DeviceService, PrismaService],
  exports: [DeviceService],
})
export class DeviceModule {}
