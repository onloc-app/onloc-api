import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module.js"
import { TokenController } from "./token.controller.js"
import { TokenService } from "./token.service.js"

@Module({
  imports: [PrismaModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
