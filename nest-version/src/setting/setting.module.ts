import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { SettingController } from "./setting.controller.js"
import { SettingService } from "./setting.service.js"

@Module({
  controllers: [SettingController],
  providers: [SettingService, PrismaService],
  exports: [SettingService],
})
export class SettingModule {}
