import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { SettingController } from "./setting.controller.js"
import { SettingService } from "./setting.service.js"

@Module({
  imports: [PrismaModule],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
