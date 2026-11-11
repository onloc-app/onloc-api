import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Setting } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostSettingRequestDto } from "./dtos/requests/post-setting-request.dto.js"
import { PatchSettingRequestDto } from "./dtos/requests/patch-setting-request.dto.js"

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: PostSettingRequestDto): Promise<Setting> {
    const existing = await this.prisma.setting.findFirst({
      where: { key: data.key },
    })
    if (existing) {
      throw new BadRequestException("Setting already exists")
    }

    return await this.prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(): Promise<Setting[]> {
    return await this.prisma.setting.findMany()
  }

  async findOne(id: bigint): Promise<Setting> {
    const setting = await this.prisma.setting.findUnique({
      where: { id },
    })
    if (!setting) {
      throw new NotFoundException("Setting not found")
    }
    return setting
  }

  async update(data: PatchSettingRequestDto): Promise<Setting> {
    const id = BigInt(data.id)
    const existing = await this.prisma.setting.findUnique({
      where: { id },
    })
    if (!existing) {
      throw new NotFoundException("Setting not found")
    }

    if (data.key && data.key !== existing.key) {
      const taken = await this.prisma.setting.findFirst({
        where: { key: data.key },
      })
      if (taken) {
        throw new BadRequestException(
          `Setting with key "${data.key}" already exists`,
        )
      }
    }

    const updateData: Partial<Setting> = {}
    if (data.key !== undefined) {
      updateData.key = data.key
    }
    if (data.value !== undefined) {
      updateData.value = data.value
    }

    return await this.prisma.setting.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    })
  }

  async remove(id: bigint): Promise<void> {
    const setting = await this.prisma.setting.findUnique({
      where: { id },
    })
    if (!setting) {
      throw new NotFoundException("Setting not found")
    }

    await this.prisma.setting.delete({
      where: { id },
    })
  }
}
