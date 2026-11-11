import { Controller, Get, Param, ForbiddenException } from "@nestjs/common"
import { UserService } from "./user.service.js"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { UserAdminDto } from "./dtos/user-admin.dto.js"
import { UserWithAvatarDto } from "./dtos/user-with-avatar.dto.js"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserWithAvatarDto[]> {
    const users = await this.userService.findAll()
    return users.map((user) => {
      const avatar = user.avatar
      return {
        id: user.id.toString(),
        username: user.username,
        admin: user.admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar: avatar && {
          id: avatar.id.toString(),
          user_id: avatar.user_id.toString(),
          url: avatar.url,
          created_at: avatar.created_at,
          updated_at: avatar.updated_at,
        },
      }
    })
  }

  @Get("admin")
  async findAllAdmin(@CurrentUser() user: User): Promise<UserAdminDto[]> {
    if (!user.admin) {
      throw new ForbiddenException()
    }

    const users = await this.userService.findAllAsAdmin()
    return users.map((user) => {
      const avatar = user.avatar
      return {
        id: user.id.toString(),
        username: user.username,
        admin: user.admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar: avatar && {
          id: avatar.id.toString(),
          user_id: avatar.user_id.toString(),
          url: avatar.url,
          created_at: avatar.created_at,
          updated_at: avatar.updated_at,
        },
        tier: user.tier,
        number_of_devices: user.number_of_devices,
        number_of_locations: user.number_of_locations,
      }
    })
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<UserWithAvatarDto> {
    const user = await this.userService.findOne(BigInt(id))
    const avatar = user.avatar
    return {
      id: user.id.toString(),
      username: user.username,
      admin: user.admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
      avatar: avatar && {
        id: avatar.id.toString(),
        user_id: avatar.user_id.toString(),
        url: avatar.url,
        created_at: avatar.created_at,
        updated_at: avatar.updated_at,
      },
    }
  }
}
