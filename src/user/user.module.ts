import { Module } from "@nestjs/common"
import { UserController } from "./user.controller.js"
import { UserService } from "./user.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { PasswordHasher } from "@nestjs/authentication"

@Module({
  controllers: [UserController],
  providers: [UserService, PasswordHasher, PrismaService],
})
export class UserModule {}
