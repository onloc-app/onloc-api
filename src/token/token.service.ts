import { Injectable, NotFoundException } from "@nestjs/common"
import { RefreshToken } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: bigint): Promise<RefreshToken[]> {
    return await this.prisma.refreshToken.findMany({
      where: { user_id: userId },
    })
  }

  async removeById(userId: bigint, id: bigint): Promise<void> {
    const existing = await this.prisma.refreshToken.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Token not found")
    }

    await this.prisma.refreshToken.delete({
      where: { id },
    })
  }

  async removeByToken(userId: bigint, token: string): Promise<void> {
    const existing = await this.prisma.refreshToken.findFirst({
      where: {
        token: token,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Token not found")
    }

    await this.prisma.refreshToken.delete({
      where: { id: existing.id },
    })
  }
}
