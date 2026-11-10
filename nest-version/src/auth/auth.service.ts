import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { PasswordHasher, TokenService } from "@nestjs/authentication"
import { AppService } from "../app.service.js"
import { UserDto } from "../user/dtos/user.dto.js"
import bcrypt from "bcryptjs"

@Injectable()
export class AuthService {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async login(username: string, password: string): Promise<UserDto | null> {
    const found = await this.prisma.user.findUnique({
      where: { username: username },
    })

    if (!found) {
      // Dummy check
      await this.passwordHasher.verify(password, null)
      return null
    }

    const isLegacy = found.password.startsWith("$2")
    const valid = isLegacy
      ? await bcrypt.compare(password, found.password)
      : await this.passwordHasher.verify(password, found.password)

    if (!valid) return null

    if (isLegacy || this.passwordHasher.needsRehash(found.password)) {
      await this.prisma.user.update({
        where: { id: found.id },
        data: { password: await this.passwordHasher.hash(password) },
      })
    }

    const dto: UserDto = {
      id: found.id.toString(),
      username: found.username,
      admin: found.admin,
      created_at: found.created_at,
      updated_at: found.updated_at,
    }

    return dto
  }

  async register(username: string, password: string): Promise<UserDto> {
    if (!(await this.appService.isRegistrationEnabled())) {
      throw new ForbiddenException("Registration is disabled")
    }

    const found = await this.prisma.user.findUnique({
      where: { username: username },
    })
    if (found) {
      throw new ConflictException("Username already registered")
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: { admin: true },
    })
    const hashedPassword = await this.passwordHasher.hash(password)

    const newUser = await this.prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        admin: existingAdmin ? false : true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    const defaultTier = await this.prisma.setting.findFirst({
      where: { key: "default_tier" },
    })
    if (defaultTier) {
      const tier = await this.prisma.tier.findUnique({
        where: { id: BigInt(defaultTier.value) },
      })
      if (tier) {
        await this.prisma.userTier.create({
          data: {
            user_id: newUser.id,
            tier_id: tier.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      }
    }

    const dto: UserDto = {
      id: newUser.id.toString(),
      username: newUser.username,
      admin: newUser.admin,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    }

    return dto
  }

  async refresh(refreshToken: string): Promise<string> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenRecord) {
      throw new ForbiddenException("Invalid refresh token")
    }

    try {
      const { accessToken } = await this.tokenService.issue(
        tokenRecord.user_id.toString(),
        { method: "refresh" },
      )
      return accessToken
    } catch {
      throw new ForbiddenException("Invalid refresh token")
    }
  }

  async storeRefreshToken(userId: bigint, refreshToken: string, agent: string) {
    await this.prisma.refreshToken.upsert({
      where: { token: refreshToken },
      update: {
        agent: agent,
        updated_at: new Date(),
      },
      create: {
        token: refreshToken,
        user_id: userId,
        agent: agent,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }
}
