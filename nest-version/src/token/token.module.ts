import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { TokenController } from "./token.controller.js"
import { TokenService } from "./token.service.js"

@Module({
  controllers: [TokenController],
  providers: [TokenService, PrismaService],
  exports: [TokenService],
})
export class TokenModule {}
