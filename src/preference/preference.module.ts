import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { PreferenceController } from "./preference.controller.js"
import { PreferenceService } from "./preference.service.js"

@Module({
  imports: [PrismaModule],
  controllers: [PreferenceController],
  providers: [PreferenceService],
  exports: [PreferenceService],
})
export class PreferenceModule {}
