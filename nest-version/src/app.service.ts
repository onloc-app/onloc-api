import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma/prisma.service.js"
import { readFileSync } from "fs"
import { resolve } from "path"

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async isSetup(): Promise<boolean> {
    const admin = await this.prisma.user.findFirst({
      where: {
        admin: true,
      },
    })
    return !!admin
  }

  async isRegistrationEnabled(): Promise<boolean> {
    if (!(await this.isSetup())) return true

    const registration = await this.prisma.setting.findFirst({
      where: {
        key: "registration",
        value: "true",
      },
    })
    return !!registration
  }

  getApiVersion(): string {
    const { version } = JSON.parse(
      readFileSync(resolve(import.meta.dirname, "../package.json"), "utf-8"),
    )
    return version
  }
}
