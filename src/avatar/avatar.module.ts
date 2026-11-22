import { Module } from "@nestjs/common"
import { AvatarController } from "./avatar.controller.js"
import { AvatarService } from "./avatar.service.js"
import { PrismaModule } from "../prisma/prisma.module.js"
import { AuthProvider } from "../auth/providers/auth.provider.js"

@Module({
  imports: [PrismaModule],
  controllers: [AvatarController],
  providers: [AvatarService, AuthProvider],
})
export class AvatarModule {}
