import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { PreferenceController } from "./preference.controller.js"
import { PreferenceService } from "./preference.service.js"

@Module({
  controllers: [PreferenceController],
  providers: [PreferenceService, PrismaService],
  exports: [PreferenceService],
})
export class PreferenceModule {}
