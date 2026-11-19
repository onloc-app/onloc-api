import crypto from "crypto"
import { Injectable, NotFoundException } from "@nestjs/common"
import { ApiKey } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostApiKeyRequestDto } from "./dtos/requests/post-api-key-request.dto.js"

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: bigint, data: PostApiKeyRequestDto): Promise<ApiKey> {
    return await this.prisma.apiKey.create({
      data: {
        user_id: userId,
        name: data.name,
        key: crypto.randomBytes(32).toString("hex"),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(userId: bigint): Promise<ApiKey[]> {
    return await this.prisma.apiKey.findMany({
      where: { user_id: userId },
    })
  }

  async remove(userId: bigint, id: bigint): Promise<void> {
    const existing = await this.prisma.apiKey.findFirst({
      where: {
        id,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Api key not found")
    }

    await this.prisma.apiKey.delete({
      where: { id },
    })
  }
}
