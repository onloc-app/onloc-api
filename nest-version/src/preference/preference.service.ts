import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Preference } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostPreferenceRequestDto } from "./dtos/requests/post-preference-request.dto.js"
import { PatchPreferenceRequestDto } from "./dtos/requests/patch-preference-request.dto.js"

@Injectable()
export class PreferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: bigint,
    data: PostPreferenceRequestDto,
  ): Promise<Preference> {
    if (data.user_id && BigInt(data.user_id) !== userId) {
      throw new ForbiddenException()
    }

    const existing = await this.prisma.preference.findFirst({
      where: {
        user_id: userId,
        key: data.key,
      },
    })
    if (existing) {
      throw new BadRequestException("Preference already exists")
    }

    return await this.prisma.preference.create({
      data: {
        user_id: userId,
        key: data.key,
        value: data.value,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(userId: bigint, key?: string): Promise<Preference[]> {
    if (key) {
      const pref = await this.prisma.preference.findFirst({
        where: {
          user_id: userId,
          key: key,
        },
      })
      return pref ? [pref] : []
    }

    return await this.prisma.preference.findMany({
      where: { user_id: userId },
    })
  }

  async findOne(userId: bigint, id: bigint): Promise<Preference> {
    const preference = await this.prisma.preference.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    })
    if (!preference) {
      throw new NotFoundException("Preference not found")
    }
    return preference
  }

  async update(
    userId: bigint,
    data: PatchPreferenceRequestDto,
  ): Promise<Preference> {
    if (data.user_id && BigInt(data.user_id) !== userId) {
      throw new ForbiddenException()
    }

    const id = BigInt(data.id)
    const existing = await this.prisma.preference.findFirst({
      where: {
        id,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Preference not found")
    }

    if (data.key && data.key !== existing.key) {
      const duplicate = await this.prisma.preference.findFirst({
        where: {
          user_id: userId,
          key: data.key,
        },
      })
      if (duplicate) {
        throw new BadRequestException("Preference already exists")
      }
    }

    const updateData: Partial<Preference> = {}
    if (data.key !== undefined) {
      updateData.key = data.key
    }
    if (data.value !== undefined) {
      updateData.value = data.value
    }

    return await this.prisma.preference.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    })
  }

  async remove(id: bigint, userId: bigint): Promise<void> {
    const preference = await this.prisma.preference.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    })
    if (!preference) {
      throw new NotFoundException("Preference not found")
    }

    await this.prisma.preference.delete({
      where: { id },
    })
  }
}
