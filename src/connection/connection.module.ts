import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { ConnectionService } from "./connection.service.js"
import { ConnectionController } from "./connection.controller.js"

@Module({
  controllers: [ConnectionController],
  providers: [ConnectionService, PrismaService],
})
export class ConnectionModule {}
