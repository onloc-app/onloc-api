import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { User } from "@prisma/client"
import { UserWithAvatar } from "./types/UserWithAvatar.js"
import { UserAdmin } from "./types/UserAdmin.js"
import { PasswordHasher } from "@nestjs/authentication"

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async findAll(): Promise<UserWithAvatar[]> {
    return await this.prisma.user.findMany({
      include: {
        avatar: true,
      },
    })
  }

  async findAllAsAdmin(): Promise<UserAdmin[]> {
    const users = await this.prisma.user.findMany({
      include: {
        avatar: true,
        userTiers: {
          include: {
            tier: true,
          },
        },
        devices: {
          select: {
            id: true,
            locations: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    return users.map((user) => {
      return {
        ...user,
        tier: user.userTiers[0]?.tier ?? null,
        number_of_devices: user.devices.length,
        number_of_locations: user.devices.reduce(
          (sum, device) => sum + device.locations.length,
          0,
        ),
        avatar: user.avatar,
      }
    })
  }

  async findOne(id: bigint): Promise<UserWithAvatar> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { avatar: true },
    })
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

  async update(user: User, data: Partial<User>): Promise<UserWithAvatar> {
    if (data.username && data.username !== user.username) {
      const taken = await this.prisma.user.findUnique({
        where: { username: data.username },
      })
      if (taken) throw new BadRequestException("Username taken")
    }

    const updateData: Partial<User> = {}
    if (data.username) updateData.username = data.username
    if (data.password)
      updateData.password = await this.passwordHasher.hash(data.password)
    if (data.admin !== undefined && user.admin) updateData.admin = data.admin

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { avatar: true },
    })
  }

  async remove(id: bigint): Promise<void> {
    await this.findOne(id)
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
