import { Module } from "@nestjs/common"
import { UserController } from "./user.controller.js"
import { UserService } from "./user.service.js"
import { PrismaModule } from "../prisma/prisma.module.js"
import { PasswordHasher } from "@nestjs/authentication"

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, PasswordHasher],
})
export class UserModule {}
