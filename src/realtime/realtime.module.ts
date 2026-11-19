import { Module } from "@nestjs/common"
import { QueueModule } from "../common/modules/queue/queue.module.js"
import { PrismaModule } from "../prisma/prisma.module.js"
import { RealtimeService } from "./realtime.service.js"
import { RealtimeGateway } from "./realtime.gateway.js"
import { DeliveryService } from "./delivery.service.js"

@Module({
  imports: [QueueModule, PrismaModule],
  providers: [RealtimeService, RealtimeGateway, DeliveryService],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule {}
