import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { RealtimeModule } from "../realtime/realtime.module.js"
import { UnifiedPushController } from "./unified-push.controller.js"
import { UnifiedPushService } from "./unified-push.service.js"

@Module({
  imports: [RealtimeModule, PrismaModule],
  controllers: [UnifiedPushController],
  providers: [UnifiedPushService],
  exports: [UnifiedPushService],
})
export class UnifiedPushModule {}
