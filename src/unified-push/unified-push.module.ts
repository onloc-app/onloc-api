import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { RealtimeModule } from "../realtime/realtime.module.js"
import { UnifiedPushController } from "./unified-push.controller.js"
import { UnifiedPushService } from "./unified-push.service.js"

@Module({
  imports: [RealtimeModule],
  controllers: [UnifiedPushController],
  providers: [PrismaService, UnifiedPushService],
  exports: [UnifiedPushService],
})
export class UnifiedPushModule {}
