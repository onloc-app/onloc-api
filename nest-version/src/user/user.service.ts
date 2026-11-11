import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { User } from "@prisma/client"
import { UserWithAvatar } from "./types/UserWithAvatar.js"
import { UserAdmin } from "./types/UserAdmin.js"

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async update(
    id: bigint,
    data: Partial<{ username: string; password: string; admin: boolean }>,
  ): Promise<User> {
    await this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { ...data },
    })
  }

  async remove(id: bigint): Promise<void> {
    await this.findOne(id)
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
