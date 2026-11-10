import {
  AuthenticationRegistry,
  JwtBearerProvider,
  JwtClaims,
} from "@nestjs/authentication"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service.js"
import { User } from "@prisma/client"

@Injectable()
export class AuthProvider extends JwtBearerProvider<User> {
  constructor(
    private readonly prisma: PrismaService,
    registry: AuthenticationRegistry,
  ) {
    super()
    registry.registerProvider(this)
  }

  async validate({ sub }: JwtClaims): Promise<User | null> {
    let id: bigint
    try {
      id = BigInt(sub ?? "")
    } catch {
      return null
    }

    return await this.prisma.user.findUnique({ where: { id: id } })
  }
}
