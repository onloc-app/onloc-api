import { Module } from "@nestjs/common"
import { LocationController } from "./location.controller.js"
import { LocationService } from "./location.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { AccessModule } from "../common/modules/access/access.module.js"
import { RealtimeModule } from "../realtime/realtime.module.js"

@Module({
  imports: [AccessModule, RealtimeModule],
  controllers: [LocationController],
  providers: [LocationService, PrismaService],
})
export class LocationModule {}
