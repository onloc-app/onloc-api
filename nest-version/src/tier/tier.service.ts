import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Prisma, Tier } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostTierRequestDto } from "./dtos/requests/post-tier-request.dto.js"
import { PatchTierRequestDto } from "./dtos/requests/patch-tier-request.dto.js"
import { ReorderTierItemDto } from "./dtos/requests/post-reorder-tiers-request.dto.js"

@Injectable()
export class TierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: PostTierRequestDto): Promise<Tier> {
    const existing = await this.prisma.tier.findFirst({
      where: { name: data.name },
    })
    if (existing) {
      throw new BadRequestException(
        `Tier with name "${data.name}" already exists`,
      )
    }

    return await this.prisma.tier.create({
      data: {
        name: data.name,
        max_devices: data.max_devices,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(): Promise<Tier[]> {
    return await this.prisma.tier.findMany({
      orderBy: { order_rank: "asc" },
    })
  }

  async findOne(id: bigint): Promise<Tier> {
    const tier = await this.prisma.tier.findUnique({
      where: { id },
    })
    if (!tier) {
      throw new NotFoundException()
    }
    return tier
  }

  async update(data: PatchTierRequestDto): Promise<Tier> {
    const id = BigInt(data.id)
    const existing = await this.prisma.tier.findUnique({
      where: { id },
    })
    if (!existing) {
      throw new NotFoundException()
    }

    if (data.name && data.name !== existing.name) {
      const taken = await this.prisma.tier.findFirst({
        where: { name: data.name },
      })
      if (taken) {
        throw new BadRequestException(
          `Tier with name "${data.name}" already exists`,
        )
      }
    }

    const updateData: Partial<Tier> = {}
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.max_devices !== undefined) {
      updateData.max_devices = data.max_devices
    }

    return await this.prisma.tier.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: bigint): Promise<void> {
    await this.findOne(id)

    const defaultTier = await this.prisma.setting.findFirst({
      where: { key: "default_tier" },
    })
    if (defaultTier?.value === id.toString()) {
      await this.prisma.setting.delete({
        where: { id: defaultTier.id },
      })
    }

    await this.prisma.tier.delete({
      where: { id },
    })
  }

  async reorder(items: ReorderTierItemDto[]): Promise<void> {
    const ranks = items.map((item) => item.order_rank)
    if (new Set(ranks).size !== ranks.length) {
      throw new BadRequestException("Order ranks values must be unique")
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.tier.update({
          where: { id: BigInt(item.id) },
          data: { order_rank: item.order_rank },
        }),
      ),
    )
  }
}
