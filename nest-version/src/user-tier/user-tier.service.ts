import { Injectable, NotFoundException } from "@nestjs/common"
import { UserTier } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostUserTierRequestDto } from "./dtos/requests/post-user-tier-request.dto.js"

@Injectable()
export class UserTierService {
  constructor(private readonly prisma: PrismaService) {}

  async assignOrUpdate(data: PostUserTierRequestDto): Promise<UserTier> {
    const userId = BigInt(data.user_id)
    const tierId = BigInt(data.tier_id)

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const tier = await this.prisma.tier.findFirst({
      where: { id: tierId },
    })

    if (!tier) {
      throw new NotFoundException("Tier not found")
    }

    return await this.prisma.userTier.upsert({
      where: { user_id: userId },
      update: { tier_id: tierId },
      create: {
        user_id: userId,
        tier_id: tierId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(): Promise<UserTier[]> {
    return await this.prisma.userTier.findMany()
  }

  async checkPermissions(
    userId: bigint,
  ): Promise<{ maxDevices: number | null } | null> {
    const userTier = await this.prisma.userTier.findFirst({
      where: { user_id: userId },
      include: { tier: true },
    })

    if (!userTier) {
      return null
    }

    return { maxDevices: userTier.tier.max_devices }
  }
}
