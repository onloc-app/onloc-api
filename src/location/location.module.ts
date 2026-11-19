import { Module } from "@nestjs/common"
import { LocationController } from "./location.controller.js"
import { LocationService } from "./location.service.js"
import { PrismaModule } from "../prisma/prisma.module.js"
import { AccessModule } from "../common/modules/access/access.module.js"
import { RealtimeModule } from "../realtime/realtime.module.js"

@Module({
  imports: [AccessModule, RealtimeModule, PrismaModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
