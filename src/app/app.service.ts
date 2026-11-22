import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { getApiVersion } from "../common/helpers/version.js"

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
    return getApiVersion()
  }
}
