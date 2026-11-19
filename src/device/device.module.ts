import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { QueueModule } from "../common/modules/queue/queue.module.js"
import { RealtimeModule } from "../realtime/realtime.module.js"
import { UserTierModule } from "../user-tier/user-tier.module.js"
import { AccessModule } from "../common/modules/access/access.module.js"
import { DeviceController } from "./device.controller.js"
import { DeviceService } from "./device.service.js"

@Module({
  imports: [
    UserTierModule,
    QueueModule,
    RealtimeModule,
    AccessModule,
    PrismaModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
