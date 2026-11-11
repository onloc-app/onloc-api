import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService]
})
export class UserModule {}
