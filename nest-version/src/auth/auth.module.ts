import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller.js"
import { AuthService } from "./auth.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { AppService } from "../app.service.js"
import { PasswordHasher } from "@nestjs/authentication"

@Module({
  controllers: [AuthController],
  providers: [AuthService, AppService, PrismaService, PasswordHasher],
})
export class AuthModule {}
