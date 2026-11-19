import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller.js"
import { AuthService } from "./auth.service.js"
import { PrismaModule } from "../prisma/prisma.module.js"
import { AppService } from "../app/app.service.js"
import { PasswordHasher } from "@nestjs/authentication"

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AppService, PasswordHasher],
})
export class AuthModule {}
