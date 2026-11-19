import { Module } from "@nestjs/common"
import { AvatarController } from "./avatar.controller.js"
import { AvatarService } from "./avatar.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { AuthProvider } from "../auth/providers/auth.provider.js"

@Module({
  controllers: [AvatarController],
  providers: [AvatarService, PrismaService, AuthProvider],
})
export class AvatarModule {}
