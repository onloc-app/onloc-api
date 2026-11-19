import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { ConnectionService } from "./connection.service.js"
import { ConnectionController } from "./connection.controller.js"

@Module({
  imports: [PrismaModule],
  controllers: [ConnectionController],
  providers: [ConnectionService],
})
export class ConnectionModule {}
