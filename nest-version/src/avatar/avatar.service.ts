import { Injectable, NotFoundException } from "@nestjs/common"
import type { Avatar, User } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { extname, join } from "path"
import { mkdir, unlink, writeFile } from "fs/promises"
import { randomUUID } from "crypto"

@Injectable()
export class AvatarService {
  private readonly uploadDir = "uploads/avatars"

  constructor(private readonly prisma: PrismaService) {}

  async store(user: User, file: Express.Multer.File): Promise<Avatar> {
    await mkdir(this.uploadDir, { recursive: true })

    const extension = extname(file.originalname)
    const filename = `${randomUUID()}${extension}`
    const filePath = join(this.uploadDir, filename)

    await writeFile(filePath, file.buffer)

    const fileUrl = `${this.uploadDir}/${filename}`

    const existingAvatar = await this.prisma.avatar.findUnique({
      where: { user_id: user.id },
    })

    if (existingAvatar?.url) {
      const oldDiskPath = join(process.cwd(), existingAvatar.url)
      await unlink(oldDiskPath).catch(() => null)
    }

    return await this.prisma.avatar.upsert({
      where: { user_id: user.id },
      update: {
        url: fileUrl,
      },
      create: {
        user_id: user.id,
        url: filePath,
        created_at: new Date(),
      },
    })
  }

  async remove(user: User): Promise<void> {
    const avatar = await this.prisma.avatar.findUnique({
      where: { user_id: user.id },
    })
    if (!avatar) throw new NotFoundException()

    await this.prisma.avatar.delete({
      where: { id: avatar.id },
    })

    const path = join(process.cwd(), avatar.url)
    await unlink(path).catch(() => null)
  }
}
