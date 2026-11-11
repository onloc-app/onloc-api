import {
  Controller,
  Get,
  ForbiddenException,
  Patch,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common"
import { UserService } from "./user.service.js"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { GetUsersResponseDto } from "./dtos/responses/get-users-response.dto.js"
import { GetUsersAdminResponseDto } from "./dtos/responses/get-users-admin-response.dto.js"
import { GetUserResponseDto } from "./dtos/responses/get-user-response.dto.js"
import { UserWithAvatarDto } from "./dtos/user-with-avatar.dto.js"
import { UserAdminDto } from "./dtos/user-admin.dto.js"
import { PatchUserRequestDto } from "./dtos/requests/patch-user-request.dto.js"
import { AdminGuard } from "../auth/guards/auth.guard.js"
import { IdParam } from "../common/decorators/id-param.decorator.js"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<GetUsersResponseDto> {
    const users = await this.userService.findAll()
    return {
      users: users.map((user) => {
        return UserWithAvatarDto.from(user)
      }),
    }
  }

  @UseGuards(AdminGuard)
  @Get("admin")
  async findAllAdmin(): Promise<GetUsersAdminResponseDto> {
    const users = await this.userService.findAllAsAdmin()
    return {
      users: users.map((user) => {
        return UserAdminDto.from(user)
      }),
    }
  }

  @Get("info")
  async findInfo(@CurrentUser() user: User): Promise<GetUserResponseDto> {
    const found = await this.userService.findOne(user.id)
    return {
      user: UserWithAvatarDto.from(found),
    }
  }

  @Get(":id")
  async findOne(@IdParam() id: bigint): Promise<GetUserResponseDto> {
    const user = await this.userService.findOne(BigInt(id))
    return {
      user: UserWithAvatarDto.from(user),
    }
  }

  @Patch()
  async update(
    @CurrentUser() user: User,
    @Body() body: PatchUserRequestDto,
  ): Promise<GetUserResponseDto> {
    const updated = await this.userService.update(user, body)
    return {
      user: UserWithAvatarDto.from(updated),
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    const formattedId = BigInt(id)
    if (formattedId !== user.id && !user.admin) {
      throw new ForbiddenException()
    }
    await this.userService.remove(formattedId)
  }
}
